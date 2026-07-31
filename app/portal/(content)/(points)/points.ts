import { attendance, PointRequirement, event } from "@prisma/client";

import { RequirementProgressData } from "@/types";

export function getActivePointRequirements(
  attendances: attendance[],
  activePointRequirements: PointRequirement[],
  events: event[],
) {
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
