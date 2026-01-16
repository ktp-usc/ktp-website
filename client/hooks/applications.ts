import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/client/api/fetcher";
import { qk } from "@/client/queries/keys";
import { applications as Application } from "@prisma/client";

// -----------------------------
// applicant: "me" hooks
// -----------------------------

export function useMyApplicationQuery() {
    return useQuery({
        queryKey: qk.myApplication,
        queryFn: () => fetchJson<Application | null>("/api/applications/me"),
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
}

export function useCreateMyApplicationMutation() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (body: { fullName: string; email: string } & Record<string, unknown>) =>
            fetchJson<Application>("/api/applications/me", {
                method: "POST",
                body: JSON.stringify(body)
            }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: qk.myApplication });
        }
    });
}

export function useUpdateMyApplicationMutation() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (body: Partial<Record<string, unknown>>) =>
            fetchJson<Application>("/api/applications/me", {
                method: "PATCH",
                body: JSON.stringify(body)
            }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: qk.myApplication });
        }
    });
}

export function useSubmitMyApplicationMutation() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: () =>
            fetchJson<Application>("/api/applications/me/submit", {
                method: "POST"
            }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: qk.myApplication });
        }
    });
}

// -----------------------------
// admin: list + detail hooks
// -----------------------------

type ApplicationsListResponse =
    | Application[] // if your API returns an array
    | { items: Application[]; total: number } // if your API returns { items, total }
    | { ok: true; data: Application[] }; // if your API returns { ok, data }

function normalizeApplicationsList(payload: ApplicationsListResponse): { items: Application[]; total: number | null } {
    if (Array.isArray(payload)) return { items: payload, total: null };
    if ("items" in payload) return { items: payload.items, total: payload.total ?? null };
    if ("data" in payload) return { items: (payload as any).data ?? [], total: null };
    return { items: [], total: null };
}

export function useApplicationsQuery(filters: Record<string, unknown> = {}) {
    const params = new URLSearchParams(filters as any).toString();
    const url = params ? `/api/applications?${ params }` : "/api/applications";

    return useQuery({
        queryKey: qk.applications(filters),
        queryFn: async () => {
            const payload = await fetchJson<ApplicationsListResponse>(url);
            return normalizeApplicationsList(payload);
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
}

export function useApplicationQuery(id: string) {
    return useQuery({
        queryKey: qk.application(id),
        queryFn: () => fetchJson<Application>(`/api/applications/${ id }`),
        enabled: Boolean(id),
        staleTime: 0,
        gcTime: 0
    });
}

export function useUpdateApplicationMutation(id: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (body: Record<string, unknown>) =>
            fetchJson<Application>(`/api/applications/${ id }`, {
                method: "PATCH",
                body: JSON.stringify(body)
            }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: qk.application(id) });
            await qc.invalidateQueries({ queryKey: qk.applications({}) });
        }
    });
}

export function useDeleteApplicationMutation(id: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: () => fetchJson<{ ok: true }>(`/api/applications/${ id }`, { method: "DELETE" }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: qk.applications({}) });
        }
    });
}

export function useCreateApplicationCommentMutation(id: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (body: { body?: string; statusOverride?: string; commenter?: string }) =>
            fetchJson(`/api/applications/${ id }/comments`, {
                method: "POST",
                body: JSON.stringify(body)
            }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: qk.application(id) });
            await qc.invalidateQueries({ queryKey: qk.applications({}) });
        }
    });
}

/**
 * ✅ this is the "new spec" shape for flags:
 * PATCH /api/applications/[id]/flag with JSON { isFlagged: boolean }
 *
 * if your current backend is still POST { value }, update the backend to match this hook.
 */
export function useSetApplicationFlagMutation(id: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (isFlagged: boolean) =>
            fetchJson(`/api/applications/${ id }/flag`, {
                method: "PATCH",
                body: JSON.stringify({ isFlagged })
            }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: qk.application(id) });
            await qc.invalidateQueries({ queryKey: qk.applications({}) });
        }
    });
}

/**
 * Convenience wrapper for UI code that wants "toggle" semantics.
 */
export function useToggleApplicationFlagMutation(id: string) {
    const setFlag = useSetApplicationFlagMutation(id);

    return useMutation({
        mutationFn: async ({ current }: { current: boolean }) => {
            await setFlag.mutateAsync(!current);
        },
        onSuccess: async () => {
            // setFlag already invalidates, but keeping this is harmless if you want belt + suspenders
        }
    });
}

/**
 * Prefer status changes through comments in your schema (comment.statusOverride),
 * but if you still want a dedicated endpoint, make it:
 * PATCH /api/applications/[id]/status { status: applicationStatus }
 */
export function useSetApplicationStatusMutation(id: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (status: string) =>
            fetchJson(`/api/applications/${ id }/status`, {
                method: "PATCH",
                body: JSON.stringify({ status })
            }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: qk.application(id) });
            await qc.invalidateQueries({ queryKey: qk.applications({}) });
        }
    });
}
