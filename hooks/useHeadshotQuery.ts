// @/hooks/useHeadshotQuery.ts
'use client';

import { useQuery } from '@tanstack/react-query';

type AccountHeadshotResponse = { headshotBlobURL: string | null };

async function fetchHeadshot(userId: string): Promise<AccountHeadshotResponse> {
    const res = await fetch(`/api/accounts/${userId}/headshot`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include'
    });

    if (!res.ok) return { headshotBlobURL: null };
    return (await res.json()) as AccountHeadshotResponse;
}

export function useHeadshotQuery(userId: string | null) {
    return useQuery({
        queryKey: ['headshot', userId],
        queryFn: () => fetchHeadshot(userId as string),
        enabled: !!userId,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
}
