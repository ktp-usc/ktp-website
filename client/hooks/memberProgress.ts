import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useAdjustMemberPointsMutation(semester: string = nextSemesters[0]) {
  const queryClient = useQueryClient();
  const queryKey = qk.memberProgress(semester);

  return useMutation({
    mutationFn: ({ accountId, delta }: { accountId: string; delta: number }) =>
      fetchJson<{ pointsAwarded: number }>(`/api/accounts/${accountId}/points`, {
        method: "POST",
        body: JSON.stringify({ delta }),
      }),
    onMutate: ({ accountId, delta }) => {
      queryClient.setQueryData<MemberProgressResponse>(queryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          items: current.items.map((item) =>
            item.id === accountId
              ? { ...item, totalPoints: Math.max(0, item.totalPoints + delta) }
              : item,
          ),
        };
      });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
