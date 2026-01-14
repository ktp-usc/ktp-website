// app/portal/layout.tsx
'use client';

import type { ReactNode } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import PortalHeader from './PortalHeader';

import { useSessionQuery } from '@/hooks/useSessionQuery';
import { usePortalUserQuery } from '@/hooks/usePortalUserQuery';
import { useHeadshotQuery } from '@/hooks/useHeadshotQuery';

export default function PortalLayout({ children }: { children: ReactNode }) {
    const { data: sessionData, isFetching: sessionFetching } = useSessionQuery();
    const userId = sessionData?.user?.id ?? null;

    const { data: account, isFetching: portalUserFetching } = usePortalUserQuery(userId);
    const { data: headshotData } = useHeadshotQuery(userId);

    const isLoading = sessionFetching || portalUserFetching;

    const fullName = account ? `${account.firstName ?? ''} ${account.lastName ?? ''}`.trim() : '';
    const headshotUrl = headshotData?.headshotBlobURL ?? account?.headshotBlobURL ?? null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800 transition-colors duration-300">
            <ThemeToggle />
            <PortalHeader headshotUrl={headshotUrl} fullName={fullName} isLoading={isLoading} />
            {children}
        </div>
    );
}
