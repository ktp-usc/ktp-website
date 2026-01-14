// app/portal/page.tsx  (update to remove the header + outer wrapper)
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { type as AccountType } from '@prisma/client';

import { useSessionQuery } from '@/hooks/useSessionQuery';
import { usePortalUserQuery } from '@/hooks/usePortalUserQuery';

type PortalRole = 'exec' | 'applicant' | 'member';
type ApplicationViewStatus = 'NOT_STARTED' | 'DRAFT' | 'SUBMITTED';

function toPortalRole(typeValue: AccountType | null | undefined): PortalRole {
    if (typeValue === 'LEADERSHIP') return 'exec';
    if (typeValue === 'BROTHER' || typeValue === 'ALUMNI') return 'member';
    return 'applicant';
}

function formatDate(dateLike: string | Date | null | undefined): string {
    if (!dateLike) return '—';
    const d = typeof dateLike === 'string' ? new Date(dateLike) : dateLike;
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function PortalHomePage() {
    const router = useRouter();

    const { data: sessionData, isFetching: sessionFetching } = useSessionQuery();
    const userId = sessionData?.user?.id ?? null;

    const { data: account, isFetching: portalUserFetching } = usePortalUserQuery(userId);

    const isLoading = sessionFetching || portalUserFetching;

    const role = useMemo<PortalRole>(() => toPortalRole(account?.type ?? null), [account?.type]);
    const firstName = useMemo(() => account?.firstName?.trim() || 'there', [account?.firstName]);

    const appStatus = useMemo<ApplicationViewStatus>(() => {
        const app = account?.applications ?? null;
        if (!app) return 'NOT_STARTED';
        if (!app.submittedAt) return 'DRAFT';
        return 'SUBMITTED';
    }, [account?.applications]);

    const getStatusColor = (status: ApplicationViewStatus) => {
        switch (status) {
            case 'SUBMITTED':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'DRAFT':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'NOT_STARTED':
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: ApplicationViewStatus) => {
        switch (status) {
            case 'SUBMITTED':
                return 'Submitted';
            case 'DRAFT':
                return 'Draft';
            case 'NOT_STARTED':
            default:
                return 'Not started';
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-6 py-8 bg-transparent transition-colors duration-300">
            {/* signed out */}
            {!userId && !sessionFetching ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You’re not signed in</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Sign in to access the portal.</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push('/auth/sign-in')}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                            type="button"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => router.push('/auth/sign-up')}
                            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            type="button"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            ) : null}

            {/* welcome */}
            {userId ? (
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                        Welcome, {isLoading ? '…' : firstName}!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {role === 'exec'
                            ? 'Manage applications and chapter roster from your dashboard.'
                            : 'Track your application status and stay updated.'}
                    </p>
                </div>
            ) : null}

            {/* applicant view */}
            {userId && role === 'applicant' ? (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                        Your Application
                    </h3>

                    <div
                        onClick={() => router.push('/application/view')}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') router.push('/application/view');
                        }}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg dark:bg-gray-900 dark:border-gray-600 dark:hover:border-gray-400 transition-all cursor-pointer border border-gray-200 overflow-hidden group"
                        role="button"
                        tabIndex={0}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                                            Spring 2026 Application
                                        </h4>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appStatus)}`}>
                                            {getStatusText(appStatus)}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                        {appStatus === 'SUBMITTED'
                                            ? `Submitted on ${formatDate(account?.applications?.submittedAt)}`
                                            : appStatus === 'DRAFT'
                                                ? `Created on ${formatDate(account?.applications?.createdAt)}`
                                                : 'No application started yet'}
                                    </p>
                                </div>

                                <svg
                                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1 dark:text-white transition-colors duration-300">Major</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-300 transition-colors duration-300">
                                        {account?.applications?.major ?? '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1 dark:text-white transition-colors duration-300">Year</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-300 transition-colors duration-300">
                                        {account?.applications?.classification ?? '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1 dark:text-white transition-colors duration-300">GPA</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-300 transition-colors duration-300">
                                        {account?.applications?.gpa != null ? String(account.applications.gpa) : '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* exec view */}
            {userId && role === 'exec' ? (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                        Executive Dashboard
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        <button
                            onClick={() => router.push('/portal/exec/applications')}
                            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
                            type="button"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                                View Spring 2026 Applicants
                            </h4>
                            <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                                Review and manage all applications for the Spring 2026 recruitment cycle.
                            </p>
                        </button>

                        <button
                            onClick={() => router.push('/portal/exec/roster')}
                            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
                            type="button"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                                Modify Chapter Roster
                            </h4>
                            <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                                Update member information and manage the active chapter roster.
                            </p>
                        </button>
                    </div>
                </div>
            ) : null}

            {/* member view */}
            {userId && role === 'member' ? (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                        Member Dashboard
                    </h3>
                </div>
            ) : null}
        </main>
    );
}
