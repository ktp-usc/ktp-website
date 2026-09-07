// app/api/applications/me/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";
import { ok, created, badRequest, serverError } from "@/lib/http/responses";
import {
  APPLICATION_FOR_SEMESTER_EXISTS,
  APPLICATION_LIMIT_REACHED,
  MAX_APPLICATIONS_PER_USER,
} from "@/lib/applications";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length ? s : null;
}

function normalizeStringArray(v: unknown): string[] | undefined {
  // undefined => don't change
  if (v === undefined) return undefined;

  // null => clear
  if (v === null) return [];

  if (!Array.isArray(v)) return undefined;

  return v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean);
}

function normalizeGpa(v: unknown): number | null | undefined {
  // undefined => don't change
  if (v === undefined) return undefined;

  // null/empty => clear
  if (v === null || v === "") return null;

  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n;
}

export async function GET() {
  const authed = await requireUser();
  if ("response" in authed) return authed.response;

  try {
    const app = await prisma.applications.findMany({
      where: { userId: authed.user.id },
      include: { comments: { orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    });

    return ok(app);
  } catch (e) {
    console.error(e);
    return serverError();
  }
}

export async function POST(req: Request) {
  const authed = await requireUser();
  if ("response" in authed) return authed.response;
  let user;
  try {
    const res = await prisma.accounts.findFirst({
      where: { id: authed.user.id },
    });
    user = res;
  } catch (error) {
    return console.error(error);
  }
  let semester;
  try {
    const res = await prisma.currentSemester.findFirst({});
    semester = res?.semester;
  } catch (error) {
    return console.error(error);
  }
  try {
    const existingCount = await prisma.applications.count({
      where: { userId: authed.user.id },
    });
    if (existingCount >= MAX_APPLICATIONS_PER_USER) {
      return NextResponse.json(
        { error: APPLICATION_LIMIT_REACHED },
        { status: 409 },
      );
    }
  } catch (error) {
    console.error(error);
    return serverError();
  }

  if (semester) {
    try {
      const app = await prisma.applications.findFirst({
        where: { userId: authed.user?.id, semester: semester },
      });
      if (app) {
        return badRequest(APPLICATION_FOR_SEMESTER_EXISTS);
      }
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }

  try {
    const app = await prisma.applications.create({
      data: {
        userId: authed.user.id,
        fullName: user?.firstName + " " + user?.lastName,
        email: user?.schoolEmail ?? "",
        classification: "",
        major: "",
        minor: "",
        resumeUrl: "",
        reason: "",
        circumstance: "",
        gpa: 0.0,
        eventsAttended: [],
        semester: typeof semester === "string" ? semester : "ERROR",
      },
    });

    return created(app);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: "application_already_exists" },
      { status: 409 },
    );
  }
}

import type { applicationStatus } from "@prisma/client";

export async function PATCH(req: Request) {
  const authed = await requireUser();
  if ("response" in authed) return authed.response;

  try {
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("invalid_json");

    // -------------------------------
    // 1) draft fields (same as before)
    // -------------------------------
    const draftData = {
      classification:
        body.classification === undefined
          ? undefined
          : normalizeString(body.classification),
      major: body.major === undefined ? undefined : normalizeString(body.major),
      minor: body.minor === undefined ? undefined : normalizeString(body.minor),
      resumeUrl:
        body.resumeUrl === undefined
          ? undefined
          : normalizeString(body.resumeUrl),
      reason:
        body.reason === undefined ? undefined : normalizeString(body.reason),
      circumstance:
        body.circumstance === undefined
          ? undefined
          : normalizeString(body.circumstance),
      eventsAttended: normalizeStringArray(body.eventsAttended),
      gpa: normalizeGpa(body.gpa),
      // lastModified is @updatedAt so prisma handles it
    } as const;

    // --------------------------------------------
    // 2) optional status transition (guarded)
    //    only allow: BID_OFFERED -> BID_ACCEPTED/DECLINED
    // --------------------------------------------
    const requestedStatusRaw = body.status as applicationStatus | undefined;
    const requestedStatus =
      requestedStatusRaw === "BID_ACCEPTED" ||
      requestedStatusRaw === "BID_DECLINED"
        ? requestedStatusRaw
        : undefined;

    const applicationId =
      typeof body.id === "string" && body.id.trim().length
        ? body.id.trim()
        : null;

    // we only need to fetch current status if they are attempting a status change
    let statusPatch: { status?: applicationStatus } = {};
    if (requestedStatus) {
      if (!applicationId) {
        return badRequest("application_id_required");
      }

      const current = await prisma.applications.findFirst({
        where: { id: applicationId, userId: authed.user.id },
        select: { status: true },
      });

      if (!current) {
        return badRequest("application_not_found");
      }

      if (current.status !== "BID_OFFERED") {
        return badRequest("invalid_status_transition");
      }

      statusPatch = { status: requestedStatus };
    } else if (body.status !== undefined) {
      // they tried to set status, but not to an allowed value
      return badRequest("invalid_status_value");
    }

    // combine patches
    const data = {
      ...draftData,
      ...statusPatch,
    };

    if (!applicationId) {
      return badRequest("application_id_required");
    }

    const ownedApplication = await prisma.applications.findFirst({
      where: { id: applicationId, userId: authed.user.id },
      select: { id: true },
    });

    if (!ownedApplication) {
      return badRequest("application_not_found");
    }

    // update-first (don’t create automatically on page load — only when user saves)
    try {
      const updated = await prisma.applications.update({
        where: { id: applicationId },
        data,
      });
      return ok(updated);
    } catch (e: any) {
      if (e?.code !== "P2025") {
        console.error(e);
        return serverError();
      }
    }

    // if they tried to change status, but app doesn't exist, do not create
    if (requestedStatus) {
      return badRequest("application_not_found");
    }

    const existingCount = await prisma.applications.count({
      where: { userId: authed.user.id },
    });
    if (existingCount >= MAX_APPLICATIONS_PER_USER) {
      return NextResponse.json(
        { error: APPLICATION_LIMIT_REACHED },
        { status: 409 },
      );
    }

    // create fallback requires fullName/email (use body if provided, else derive from accounts)
    const account = await prisma.accounts.findUnique({
      where: { id: authed.user.id },
      select: {
        firstName: true,
        lastName: true,
        schoolEmail: true,
        personalEmail: true,
      },
    });

    const derivedFullName =
      normalizeString(body.fullName) ??
      normalizeString(
        `${account?.firstName ?? "john"} ${account?.lastName ?? "smith"}`,
      ) ??
      "john smith";

    const derivedEmail =
      normalizeString(body.email) ??
      normalizeString(account?.schoolEmail) ??
      normalizeString(account?.personalEmail) ??
      "unknown@sc.edu";

    const createdApp = await prisma.applications.create({
      data: {
        userId: authed.user.id,
        fullName: derivedFullName,
        email: derivedEmail,
        classification: data.classification ?? null,
        major: data.major ?? null,
        minor: data.minor ?? null,
        resumeUrl: data.resumeUrl ?? null,
        reason: data.reason ?? null,
        circumstance: data.circumstance ?? null,
        gpa: data.gpa ?? null,
        eventsAttended: Array.isArray(data.eventsAttended)
          ? data.eventsAttended
          : [],
        // note: do not set status here; let prisma default apply
      },
    });

    return ok(createdApp);
  } catch (e) {
    console.error(e);
    return serverError();
  }
}
