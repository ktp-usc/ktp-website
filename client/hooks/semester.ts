import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/client/api/jsonutils";
import { qk } from "@/client/queries/keys";

export type CurrentSemesterResponse = {
  semester: string | null;
};

export function useCurrentSemesterQuery() {
  return useQuery({
    queryKey: qk.currentSemester,
    queryFn: () => fetchJson<CurrentSemesterResponse>("/api/semester"),
  });
}

export function useUpdateCurrentSemesterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (semester: string) =>
      fetchJson<CurrentSemesterResponse>("/api/semester", {
        method: "PUT",
        body: JSON.stringify({ semester }),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(qk.currentSemester, data);
    },
  });
}
