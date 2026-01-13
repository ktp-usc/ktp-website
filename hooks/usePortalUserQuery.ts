// @/hooks/usePortalUserQuery.ts
'use client';

import { useQuery } from '@tanstack/react-query';

type AccountType = 'APPLICANT' | 'PNM' | 'BROTHER' | 'LEADERSHIP' | 'ALUMNI' | null;

export type PortalApplication = {
    id: string;
    fullName: string;
    email: string;
    classification: string | null;
    major: string | null;
    minor: string | null;
    createdAt: string | null;
    submittedAt: string | null;
    gpa: number | null;
    linkedin: string | null;
    github: string | null;
};

export type PortalAccount = {
    id: string;
    firstName: string;
    lastName: string;
    type: AccountType;
    schoolEmail: string | null;
    headshotBlobURL: string | null;
    linkedin: string | null;
    github: string | null;
    applications: PortalApplication | null;
};

type PortalUserResponse = { data: PortalAccount };

async function fetchPortalUser(userId: string): Promise<PortalUserResponse> {
    const res = await fetch(`/api/accounts/${userId}`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include'
    });

    if (!res.ok) throw new Error('Failed to fetch portal user');
    return (await res.json()) as PortalUserResponse;
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
