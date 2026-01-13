import { useQuery } from '@tanstack/react-query';

type SessionResponse = { user: { id: string; name?: string | null; email?: string | null } | null };

async function fetchSession(): Promise<SessionResponse> {
    const res = await fetch('/api/auth/get-session', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include'
    });

    if (!res.ok) return { user: null };
    return (await res.json()) as SessionResponse;
}

export function useSessionQuery() {
    return useQuery({
        queryKey: ['session'],
        queryFn: fetchSession,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
}
