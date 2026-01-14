// @/hooks/usePortalUserQuery.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import type { Prisma } from '@prisma/client';

export type PortalUser = Prisma.accountsGetPayload<{
    include: { applications: true };
}>;

async function fetchPortalUser(userId: string): Promise<PortalUser> {
    const res = await fetch(`/api/accounts/${userId}`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include'
    });

    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'Failed to fetch portal user');
    }

    const json = (await res.json()) as { data: PortalUser };
    return json.data;
}

export function usePortalUserQuery(userId: string | null) {
    return useQuery({
        queryKey: ['portalUser', userId],
        queryFn: () => fetchPortalUser(userId as string),
        enabled: !!userId,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
}
