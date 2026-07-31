import { PointRequirement } from "@prisma/client";
// (alias) type PointRequirement = {
//     name: string;
//     id: string;
//     semester: string;
//     description: string;
//     requiredAmount: number;
//     pointsPerCompletion: number;
//     maxPoints: number;
//     memberType: $Enums.memberType;
// }

type PointRequirementProgress = {
  requirement: PointRequirement;
  completed: number;
};
export type RequirementProgressData = {
  categoriesCompleted: number;
  totalPoints: number;
  totalCategories: number;
  pointRequirementProgress: PointRequirementProgress[];
};
