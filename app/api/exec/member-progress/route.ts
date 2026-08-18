import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { ok, serverError } from "@/lib/http/responses";
import { nextSemesters } from "@/data/requirementOptions";
import {
  getActivePointRequirements,
  percentComplete,
  requirementMemberTypesForUiType,
  uiTypeFromAccountType,
} from "@/lib/points/progress";
import type { PointRequirement, type as AccountType } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const TRACKED_ACCOUNT_TYPES: AccountType[] = [
  "BROTHER",
  "LEADERSHIP",
  "CHAIR",
  "PNM",
  "APPLICANT",
];

export async function GET(req: Request) {
  const authed = await requireAdmin();
  if ("response" in authed) return authed.response;

  try {
    const { searchParams } = new URL(req.url);
    const semester =
      (searchParams.get("semester") ?? "").trim() || nextSemesters[0];

    const [accounts, requirements, events] = await Promise.all([
      prisma.accounts.findMany({
        where: { type: { in: TRACKED_ACCOUNT_TYPES } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          type: true,
          headshotBlobURL: true,
        },
      }),
      prisma.pointRequirement.findMany({
        where: { semester },
      }),
      prisma.event.findMany(),
    ]);

    const accountIds = accounts.map((account) => account.id);
    const attendanceRows =
      accountIds.length === 0
        ? []
        : await prisma.attendance.findMany({
            where: { accountId: { in: accountIds } },
          });

    const attendanceByAccount = new Map<string, typeof attendanceRows>();
    for (const row of attendanceRows) {
      const existing = attendanceByAccount.get(row.accountId);
      if (existing) {
        existing.push(row);
      } else {
        attendanceByAccount.set(row.accountId, [row]);
      }
    }

    const requirementsByUiType = {
      Active: filterRequirements(requirements, "Active"),
      Pledge: filterRequirements(requirements, "Pledge"),
      Applicant: filterRequirements(requirements, "Applicant"),
    };

    const items = accounts.flatMap((account) => {
      const uiType = uiTypeFromAccountType(account.type);
      if (!uiType) return [];

      const progress = getActivePointRequirements(
        attendanceByAccount.get(account.id) ?? [],
        requirementsByUiType[uiType],
        events,
      );

      return [{
        id: account.id,
        firstName: account.firstName,
        lastName: account.lastName,
        type: account.type,
        uiType,
        headshotBlobURL: account.headshotBlobURL,
        totalPoints: progress.totalPoints,
        categoriesCompleted: progress.categoriesCompleted,
        totalCategories: progress.totalCategories,
        percentComplete: percentComplete(
          progress.categoriesCompleted,
          progress.totalCategories,
        ),
        pointRequirementProgress: progress.pointRequirementProgress,
      }];
    });

    return ok({ semester, items });
  } catch (e) {
    console.error("GET /api/exec/member-progress error:", e);
    return serverError();
  }
}

function filterRequirements(
  requirements: PointRequirement[],
  uiType: "Active" | "Pledge" | "Applicant",
) {
  const allowed = new Set(requirementMemberTypesForUiType(uiType));
  return requirements.filter((requirement) => allowed.has(requirement.memberType));
}
