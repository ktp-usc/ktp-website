import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/client/queries/keys";
import { postJSON } from "@/client/api/jsonutils";

type SessionResponse = {
    user: { id: string; name?: string | null; email?: string | null } | null;
};

async function fetchSession(): Promise<SessionResponse> {
    const res = await fetch("/api/auth/session", {
        method: "GET",
        cache: "no-store",
        credentials: "include"
    });

    if (!res.ok) return { user: null };
    return (await res.json()) as SessionResponse;
}

export function useSessionQuery() {
    return useQuery({
        queryKey: qk.session,
        queryFn: fetchSession,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
}

export function useSignOutMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["auth", "sign-out"],
        mutationFn: async () => {
            const res = await fetch("/api/auth/sign-out", {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({})
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`[sign-out] ${ res.status } ${ text }`);
            }

            return;
        },
        onSuccess: async () => {
            // invalidate session so all auth-aware UI updates immediately
            await queryClient.invalidateQueries({ queryKey: qk.session });
        }
    });
}

export function useRequestPasswordResetMutation() {
    return useMutation({
        mutationFn: async (email: string) => {
            return postJSON<{ ok: boolean }>("/api/auth/request-password-reset", { email });
        }
    });
}

export function useResetPasswordMutation() {
    return useMutation({
        mutationFn: async (args: { token?: string; code?: string; password: string }) => {
            return postJSON<{ ok: boolean }>("/api/auth/reset-password", args);
        }
    });
}


