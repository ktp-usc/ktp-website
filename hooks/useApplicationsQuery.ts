// @/hooks/useApplicationsQuery.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import type { Prisma } from '@prisma/client';

export type ApplicationWithComments = Prisma.applicationsGetPayload<{
    include: { comments: true };
}>;

type ApiResponse = { ok: true; data: ApplicationWithComments[] };

async function fetchApplications(): Promise<ApplicationWithComments[]> {
    const res = await fetch('/api/applications?limit=200', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include'
    });

    if (!res.ok) throw new Error('Failed to fetch applications');

    const body = (await res.json()) as ApiResponse;
    return body.data;
}

export function useApplicationsQuery() {
    return useQuery({
        queryKey: ['applications'],
        queryFn: fetchApplications,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
}
