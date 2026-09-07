import { prisma } from "@/lib/prisma";
import { requireBrother } from "@/lib/auth/guards";
import { ok, serverError } from "@/lib/http/responses";
import { applicationStatus, type as AccountType } from "@prisma/client";
import { lastNameFromFullName } from "@/lib/applications/status";
import { rusheeCommenterIdentity } from "@/lib/rushees";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const authed = await requireBrother();
  if ("response" in authed) return authed.response;

  const { commenter, aliases } = rusheeCommenterIdentity(
    authed.account,
    authed.user.id,
  );

  try {
    const current = await prisma.currentSemester.findFirst();
    const currentSemester = current?.semester;

    const applications = await prisma.applications.findMany({
      where: {
        status: { not: applicationStatus.CLOSED },
        accounts: { is: { type: AccountType.APPLICANT } },
        ...(currentSemester ? { semester: currentSemester } : {}),
      },
      select: {
        id: true,
        fullName: true,
        status: true,
        userId: true,
        lastModified: true,
        comments: {
          where: { commenter: { in: aliases } },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, body: true, createdAt: true },
        },
        accounts: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            headshotBlobURL: true,
          },
        },
      },
    });

    const byUser = new Map<string, (typeof applications)[number]>();
    for (const app of applications) {
      const existing = byUser.get(app.userId);
      if (!existing || app.lastModified > existing.lastModified) {
        byUser.set(app.userId, app);
      }
    }

    const items = [...byUser.values()]
      .sort((a, b) =>
        lastNameFromFullName(a.fullName).localeCompare(
          lastNameFromFullName(b.fullName),
        ),
      )
      .map((app) => {
        const mine = app.comments[0];
        const nameFromAccount = [app.accounts.firstName, app.accounts.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        return {
          accountId: app.accounts.id,
          applicationId: app.id,
          fullName: app.fullName || nameFromAccount || "Unknown",
          status: app.status,
          userId: app.userId,
          headshotUrl: app.accounts.headshotBlobURL,
          myComment: mine
            ? {
                id: mine.id,
                body: mine.body ?? "",
                createdAt: mine.createdAt.toISOString(),
              }
            : null,
        };
      });

    return ok({ items, commenter });
  } catch (e) {
    console.error("GET /api/rushees error:", e);
    return serverError();
  }
}
