"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { applicationStatus, applications } from "@prisma/client";
import { fetchJson } from "@/client/api/jsonutils";
import { qk } from "@/client/queries/keys";

export type IncomingApplicationsFilters = {
  currentSemester?: boolean;
  flagged?: boolean | "all";
  search?: string;
  status?: applicationStatus | "all";
  sortBy?: "name" | "status" | "createdAt";
  sortOrder?: "asc" | "desc";
};

type IncomingListResponse = {
  items: applications[];
  total: number;
};

type StatusPatchResult = {
  count: number;
  updates?: { id: string; status: applicationStatus }[];
  ids?: string[];
  status?: applicationStatus;
};

type StatusPatchInput =
  | { ids: string[]; status: applicationStatus }
  | { updates: { id: string; status: applicationStatus }[] };

function patchIds(input: StatusPatchInput): string[] {
  return "updates" in input
    ? input.updates.map((update) => update.id)
    : input.ids;
}

const SEARCH_DEBOUNCE_MS = 250;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function buildIncomingUrl(filters: {
  currentSemester: boolean;
  flagged: boolean | "all";
  search: string;
  status: applicationStatus | "all";
  sortBy: "name" | "status" | "createdAt";
  sortOrder: "asc" | "desc";
}): string {
  const params = new URLSearchParams();
  params.set("current", filters.currentSemester ? "true" : "false");
  params.set("sort", filters.sortBy);
  params.set("order", filters.sortOrder);
  if (filters.search) params.set("q", filters.search);
  if (filters.flagged !== "all") {
    params.set("flagged", filters.flagged ? "true" : "false");
  }
  if (filters.status !== "all") params.set("status", filters.status);
  return `/api/applications/incoming?${params.toString()}`;
}

export function useIncomingApplications(
  options: IncomingApplicationsFilters = {},
) {
  const qc = useQueryClient();

  const currentSemester = options.currentSemester ?? true;
  const flagged = options.flagged ?? "all";
  const search = options.search ?? "";
  const status = options.status ?? "all";
  const sortBy = options.sortBy ?? "name";
  const sortOrder =
    options.sortOrder ?? (sortBy === "name" ? "asc" : "desc");

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const queryFilters = {
    currentSemester,
    flagged,
    search: debouncedSearch,
    status,
    sortBy,
    sortOrder,
  };

  const query = useQuery({
    queryKey: qk.incomingApplications(queryFilters),
    queryFn: () =>
      fetchJson<IncomingListResponse>(buildIncomingUrl(queryFilters)),
    placeholderData: (previous) => previous,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const statusMutation = useMutation({
    mutationFn: (input: StatusPatchInput) =>
      fetchJson<StatusPatchResult>("/api/applications/incoming", {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: async (_data, input) => {
      const ids = patchIds(input);
      await qc.invalidateQueries({ queryKey: ["applications", "incoming"] });
      await qc.invalidateQueries({ queryKey: qk.applications({}) });
      await Promise.all(
        ids.map((id) =>
          qc.invalidateQueries({ queryKey: qk.application(id) }),
        ),
      );
    },
  });

  async function updateOne(id: string, nextStatus: applicationStatus) {
    return statusMutation.mutateAsync({ ids: [id], status: nextStatus });
  }

  async function updateMany(ids: string[], nextStatus: applicationStatus) {
    return statusMutation.mutateAsync({ ids, status: nextStatus });
  }

  async function updateStatuses(
    updates: { id: string; status: applicationStatus }[],
  ) {
    return statusMutation.mutateAsync({ updates });
  }

  return {
    applications: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    loading: query.isPending,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
    updateOne,
    updateMany,
    updateStatuses,
    updating: statusMutation.isPending,
  };
}
