import { prisma } from "@/lib/prisma";
import { requireExec } from "@/lib/auth/guards";
import { applicationStatus, Prisma } from "@prisma/client";
import { badRequest, ok, serverError } from "@/lib/http/responses";
import {
  isValidStatus,
  lastNameFromFullName,
  statusSortRank,
} from "@/lib/applications/status";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_STATUS_BATCH = 200;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}

type StatusUpdate = { id: string; status: applicationStatus };

function parseUpdates(body: unknown): StatusUpdate[] | { error: string } {
  if (!body || typeof body !== "object") return { error: "invalid_body" };
  const payload = body as {
    updates?: unknown;
    ids?: unknown;
    status?: unknown;
  };

  if (Array.isArray(payload.updates)) {
    if (payload.updates.length === 0) return { error: "empty_ids" };
    const parsed: StatusUpdate[] = [];
    for (const item of payload.updates) {
      if (!item || typeof item !== "object") return { error: "invalid_id" };
      const row = item as { id?: unknown; status?: unknown };
      if (!isUuid(row.id) || !isValidStatus(row.status)) {
        return { error: !isUuid(row.id) ? "invalid_id" : "invalid_status" };
      }
      parsed.push({ id: row.id, status: row.status });
    }
    return parsed;
  }

  if (!isValidStatus(payload.status)) return { error: "invalid_status" };
  if (!Array.isArray(payload.ids) || payload.ids.length === 0) {
    return { error: "empty_ids" };
  }
  if (!payload.ids.every(isUuid)) return { error: "invalid_id" };
  return (payload.ids as string[]).map((id) => ({
    id,
    status: payload.status as applicationStatus,
  }));
}

export async function GET(req: Request) {
  const authed = await requireExec();
  if ("response" in authed) return authed.response;

  try {
    const { searchParams } = new URL(req.url);
    const current = searchParams.get("current") !== "false";
    const q = searchParams.get("q")?.trim() || "";
    const flagged = searchParams.get("flagged");
    const statusParam = searchParams.get("status") || "";
    const sortParam = searchParams.get("sort");
    const sort =
      sortParam === "status" || sortParam === "createdAt" ? sortParam : "name";
    const orderParam = searchParams.get("order");
    const order: "asc" | "desc" =
      orderParam === "asc" || orderParam === "desc"
        ? orderParam
        : sort === "name"
          ? "asc"
          : "desc";

    if (statusParam && !isValidStatus(statusParam)) {
      return badRequest("invalid_status");
    }

    let currentSemester: string | undefined;
    if (current) {
      const row = await prisma.currentSemester.findFirst();
      currentSemester = row?.semester;
    }

    const where: Prisma.applicationsWhereInput = {
      ...(currentSemester ? { semester: currentSemester } : {}),
      ...(statusParam ? { status: statusParam as applicationStatus } : {}),
      ...(flagged === "true" ? { isFlagged: true } : {}),
      ...(flagged === "false" ? { isFlagged: false } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const items = await prisma.applications.findMany({ where });

    items.sort((a, b) => {
      if (sort === "status") {
        const diff = statusSortRank(a.status) - statusSortRank(b.status);
        return order === "desc" ? -diff : diff;
      }
      if (sort === "createdAt") {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        const diff = aTime - bTime;
        return order === "desc" ? -diff : diff;
      }
      const nameCmp = lastNameFromFullName(a.fullName).localeCompare(
        lastNameFromFullName(b.fullName),
      );
      return order === "desc" ? -nameCmp : nameCmp;
    });

    return ok({ items, total: items.length });
  } catch (e) {
    console.error(e);
    return serverError();
  }
}

export async function PATCH(req: Request) {
  const authed = await requireExec();
  if ("response" in authed) return authed.response;

  try {
    const body = await req.json();
    const parsed = parseUpdates(body);
    if ("error" in parsed) return badRequest(parsed.error);

    const byId = new Map<string, applicationStatus>();
    for (const update of parsed) {
      byId.set(update.id, update.status);
    }
    const updates = [...byId.entries()].map(([id, status]) => ({ id, status }));

    if (updates.length > MAX_STATUS_BATCH) {
      return badRequest("batch_too_large");
    }

    const ids = updates.map((update) => update.id);
    const found = await prisma.applications.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    if (found.length !== ids.length) {
      const foundSet = new Set(found.map((row) => row.id));
      const missing = ids.filter((id) => !foundSet.has(id));
      return badRequest("applications_not_found", { missing });
    }

    await prisma.$transaction(
      updates.map((update) =>
        prisma.applications.update({
          where: { id: update.id },
          data: { status: update.status },
        }),
      ),
    );

    return ok({ count: updates.length, updates });
  } catch (e) {
    console.error(e);
    return serverError();
  }
}
