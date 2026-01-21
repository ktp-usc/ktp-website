import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/client/api/fetcher";
import { qk } from "@/client/queries/keys";
import type { accounts as PrismaAccount } from '@prisma/client';

export type Account = PrismaAccount;

export type AccountsListResponse = { items: Account[]; total: number };

export function useMyAccountQuery() {
    return useQuery({
        queryKey: qk.myAccount,
        queryFn: () => fetchJson<Account | null>("/api/accounts/me"),
        staleTime: 0
    });
}

export function useUpdateMyAccountMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: Partial<Record<string, unknown>>) =>
            fetchJson<Account>("/api/accounts/me", {
                method: "PATCH",
                body: JSON.stringify(body)
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: qk.myAccount })
    });
}

type UploadHeadshotResponse = { ok: true; url: string; data: Account };

export function useUploadHeadshotMutation() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("headshot", file);

            const res = await fetch("/api/accounts/me/headshot", {
                method: "POST",
                body: formData,
                credentials: "include",
                cache: "no-store"
                // do not set content-type headers
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.error ?? "Failed to upload headshot");
            }

            return (await res.json()) as UploadHeadshotResponse;
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: qk.myAccount });
        }
    });
}

type UploadResumeResponse = { ok: true; url: string; data: Account };

export function useUploadResumeMutation() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("resume", file);

            const res = await fetch("/api/accounts/me/resume", {
                method: "POST",
                body: formData,
                credentials: "include",
                cache: "no-store"
                // do not set content-type headers
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.error ?? "Failed to upload resume");
            }

            return (await res.json()) as UploadResumeResponse;
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: qk.myAccount });
        }
    });
}

// admin list
export function useAccountsQuery(filters: Record<string, unknown> = {}) {
    const params = new URLSearchParams(filters as any).toString();
    const url = params ? `/api/accounts?${ params }` : '/api/accounts';

    return useQuery({
        queryKey: qk.accounts(filters),
        queryFn: () => fetchJson<AccountsListResponse>(url)
    });
}

export function useAccountQuery(id: string) {
    return useQuery({
        queryKey: qk.account(id),
        queryFn: () => fetchJson<Account>(`/api/accounts/${ id }`),
        enabled: Boolean(id)
    });
}

export function useUpdateAccountMutation(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: Partial<Record<string, unknown>>) =>
            fetchJson<Account>(`/api/accounts/${ id }`, {
                method: "PATCH",
                body: JSON.stringify(body)
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: qk.account(id) });
            qc.invalidateQueries({ queryKey: ["accounts"] });
            qc.invalidateQueries({ queryKey: qk.accounts({}) });
        }
    });
}

export function useUpdateAccountByIdMutation() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: Partial<Record<string, unknown>> }) =>
            fetchJson<Account>(`/api/accounts/${ id }`, {
                method: 'PATCH',
                body: JSON.stringify(body)
            }),
        onSuccess: async (_data, vars) => {
            await qc.invalidateQueries({ queryKey: qk.account(vars.id) });
            await qc.invalidateQueries({ queryKey: ['accounts'] });
        }
    });
}

export function useDeleteAccountMutation(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => fetchJson<{ ok: true }>(`/api/accounts/${ id }`, { method: "DELETE" }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['accounts'] });
            qc.invalidateQueries({ queryKey: qk.accounts({}) });
        }
    });
}
