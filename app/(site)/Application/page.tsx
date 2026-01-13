'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useSessionQuery } from '@/lib/auth/useSessionQuery';
import ApplicationSection from './ApplicationSection';

export default function ApplicationPage() {
    const router = useRouter();
    const { data, isFetching } = useSessionQuery();
    const userId = data?.user?.id ?? null;

    useEffect(() => {
        if (isFetching) return;
        if (!userId) router.replace('/auth/sign-in?redirectTo=/application');
    }, [isFetching, userId, router]);

    if (isFetching) return null;
    if (!userId) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-3xl mx-auto px-6 py-10">
                <ApplicationSection />
            </div>
        </div>
    );
}
