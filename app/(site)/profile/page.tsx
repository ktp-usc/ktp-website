'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useSessionQuery } from '@/lib/auth/useSessionQuery';
import ProfileDashboard from './ProfileDashboard';

import type { accounts as Account, applications as Application } from '@prisma/client';

function isAdminAccount(account: Account) {
    // adjust this rule to match how YOU define admin
    // common: leadership or any leaderType set
    return account.type === 'BROTHER' || account.type === 'LEADERSHIP';
}

export default function ProfilePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { data, isFetching } = useSessionQuery();
    const userId = data?.user?.id ?? null;

    const [account, setAccount] = useState<Account | null>(null);
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(false);

    const tab = searchParams.get('tab') ?? 'profile';

    const isAdmin = useMemo(() => {
        if (!account) return false;
        return isAdminAccount(account);
    }, [account]);

    useEffect(() => {
        if (isFetching) return;

        if (!userId) {
            // your auth route in the screenshot is /(auth)/login => /login
            router.replace('/login?redirectTo=/profile');
            return;
        }

        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const [acctRes, appRes] = await Promise.all([
                    fetch('/api/accounts/me', { cache: 'no-store', credentials: 'include' }),
                    fetch('/api/applications/me', { cache: 'no-store', credentials: 'include' })
                ]);

                const acctBody = await acctRes.json().catch(() => null);
                const appBody = await appRes.json().catch(() => null);

                if (!cancelled) {
                    setAccount(acctRes.ok ? (acctBody?.account ?? null) : null);
                    setApplication(appRes.ok ? (appBody?.application ?? null) : null);
                }
            } catch {
                if (!cancelled) {
                    setAccount(null);
                    setApplication(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [isFetching, userId, router]);

    if (isFetching || loading) return null;
    if (!userId) return null;

    if (!account) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                Failed to load profile.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="mx-auto w-full max-w-6xl px-6 py-10">
                <ProfileDashboard
                    account={account}
                    application={application}
                    isAdmin={isAdmin}
                    activeTab={tab}
                />
            </div>
        </div>
    );
}
