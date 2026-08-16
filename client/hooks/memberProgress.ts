import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/client/api/jsonutils";
import { qk } from "@/client/queries/keys";
import { nextSemesters } from "@/data/requirementOptions";
import type { MemberProgressUiType } from "@/lib/points/progress";
import type { RequirementProgressData } from "@/types";
import type { type as AccountType } from "@prisma/client";

export type MemberProgressItem = {
  id: string;
  firstName: string;
  lastName: string;
  type: AccountType | null;
  uiType: MemberProgressUiType;
  headshotBlobURL: string | null;
  totalPoints: number;
  categoriesCompleted: number;
  totalCategories: number;
  percentComplete: number;
  pointRequirementProgress: RequirementProgressData["pointRequirementProgress"];
};

export type MemberProgressResponse = {
  semester: string;
  items: MemberProgressItem[];
};

export function useMemberProgressQuery(semester: string = nextSemesters[0]) {
  const params = new URLSearchParams({ semester }).toString();

  return useQuery({
    queryKey: qk.memberProgress(semester),
    queryFn: () =>
      fetchJson<MemberProgressResponse>(`/api/exec/member-progress?${params}`),
  });
}
