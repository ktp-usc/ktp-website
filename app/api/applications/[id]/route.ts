import { prisma } from "@/lib/prisma";
import { requireAdmin, requireExec, requireUser } from "@/lib/auth/guards";
import { badRequest, ok, serverError } from "@/lib/http/responses";
import {
  MAX_APPLICATIONS_PER_USER,
  accountTransferFromApplication,
} from "@/lib/applications";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  try {
    const app = await prisma.applications.findUnique({
      where: { id },
      include: { comments: { orderBy: { createdAt: "desc" } } },
    });

    if (!app) return badRequest("application_not_found");
    return ok(app);
  } catch (e) {
    console.error(e);
    return serverError();
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  try {
    const body = await req.json();
    const submittedAt = body.submittedAt
      ? new Date(body.submittedAt)
      : undefined;

    const existing = await prisma.applications.findUnique({
      where: { id },
      select: { userId: true, submittedAt: true },
    });

    if (!existing) return badRequest("application_not_found");

    const isFirstSubmit = Boolean(submittedAt && !existing.submittedAt);

    if (body.status !== undefined) {
      const applicantSelfSubmit =
        isFirstSubmit && body.status === "UNDER_REVIEW";
      if (!applicantSelfSubmit) {
        const authed = await requireExec();
        if ("response" in authed) return authed.response;
      }
    }

    if (isFirstSubmit) {
      const authed = await requireUser();
      if ("response" in authed) return authed.response;
      if (authed.user.id !== existing.userId) {
        const exec = await requireExec();
        if ("response" in exec) return exec.response;
      }

      const submittedCount = await prisma.applications.count({
        where: { userId: existing.userId, submittedAt: { not: null } },
      });
      if (submittedCount >= MAX_APPLICATIONS_PER_USER) {
        return badRequest("application_limit_reached");
      }
    }

    const phoneNum =
      typeof body.phoneNum === "string" ? body.phoneNum.trim() : undefined;
    const headshotBlobURL =
      typeof body.headshotBlobURL === "string"
        ? body.headshotBlobURL.trim()
        : undefined;

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.applications.update({
        where: { id },
        data: {
          fullName: body.fullName ?? undefined,
          email: body.email ?? undefined,
          classification: body.classification ?? undefined,
          major: body.major ?? undefined,
          minor: body.minor ?? undefined,
          resumeUrl: body.resumeUrl ?? undefined,
          eventsAttended: body.eventsAttended ?? undefined,
          reason: body.reason ?? undefined,
          isFlagged: body.isFlagged ?? undefined,
          submittedAt: submittedAt ?? undefined,
          status: isFirstSubmit
            ? (body.status ?? "UNDER_REVIEW")
            : (body.status ?? undefined),
          gpa: body.gpa ?? undefined,
          circumstance: body.circumstance ?? undefined,
        },
      });

      if (isFirstSubmit) {
        const account = await tx.accounts.findUnique({
          where: { id: app.userId },
          select: { headshotBlobURL: true, resumeBlobURL: true },
        });

        await tx.accounts.update({
          where: { id: app.userId },
          data: accountTransferFromApplication({
            major: app.major,
            minor: app.minor,
            resumeUrl: app.resumeUrl || account?.resumeBlobURL,
            headshotBlobURL: headshotBlobURL || account?.headshotBlobURL,
            phoneNum: phoneNum || undefined,
          }),
        });
      }

      return app;
    });

    return ok(updated);
  } catch (e) {
    console.error(e);
    return serverError();
  }
}

export async function DELETE(_: Request, ctx: Ctx) {
  const authed = await requireAdmin();
  if ("response" in authed) return authed.response;

  const { id } = await ctx.params;

  try {
    await prisma.applications.delete({ where: { id } });
    return ok({ ok: true });
  } catch (e) {
    console.error(e);
    return serverError();
  }
}
