import { attendance, PointRequirement, event, type as AccountType } from "@prisma/client";

import { RequirementProgressData } from "@/types";

export type MemberProgressUiType = "Active" | "Pledge" | "Applicant";

export function getActivePointRequirements(
  attendances: attendance[],
  activePointRequirements: PointRequirement[],
  events: event[],
): RequirementProgressData {
  const activeRequirementProgress: RequirementProgressData = {
    categoriesCompleted: 0,
    totalPoints: 0,
    totalCategories: activePointRequirements.length,
    pointRequirementProgress: activePointRequirements.map(
      (activePointRequirement) => {
        return { requirement: activePointRequirement, completed: 0 };
      },
    ),
  };

  attendances.map((attendance) => {
    const event = events.find((event) => {
      return event.id === attendance.eventId;
    });

    const pointRequirement = activePointRequirements.find((requirement) => {
      return requirement.name == event?.PointRequirement;
    });

    activeRequirementProgress.pointRequirementProgress.find((progress) => {
      if (progress.requirement.name === pointRequirement?.name) {
        progress.completed++;
      }
    });
  });
  activeRequirementProgress.pointRequirementProgress.forEach((progress) => {
    if (progress.completed >= progress.requirement.requiredAmount) {
      activeRequirementProgress.categoriesCompleted++;
    }

    activeRequirementProgress.totalPoints += Math.min(
      progress.requirement.maxPoints,
      progress.requirement.pointsPerCompletion * progress.completed,
    );
  });

  return activeRequirementProgress;
}

export function uiTypeFromAccountType(
  type: AccountType | null | undefined,
): MemberProgressUiType | null {
  if (type === "BROTHER" || type === "LEADERSHIP" || type === "CHAIR") {
    return "Active";
  }
  if (type === "PNM") return "Pledge";
  if (type === "APPLICANT") return "Applicant";
  return null;
}

export function requirementMemberTypesForUiType(uiType: MemberProgressUiType) {
  if (uiType === "Active") return ["ACTIVE", "ALL_MEMBERS"] as const;
  if (uiType === "Pledge") return ["PLEDGE", "ALL_MEMBERS"] as const;
  return ["APPLICANT", "ALL_MEMBERS"] as const;
}

export function percentComplete(
  categoriesCompleted: number,
  totalCategories: number,
): number {
  if (totalCategories <= 0) return 0;
  return (categoriesCompleted / totalCategories) * 100;
}

export function isFullyComplete(
  categoriesCompleted: number,
  totalCategories: number,
): boolean {
  return totalCategories > 0 && categoriesCompleted === totalCategories;
}
