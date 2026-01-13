// app/portal/page.tsx  (THIS is your portal page, edited)
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { User } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

import { useSessionQuery } from '@/hooks/useSessionQuery';
import { usePortalUserQuery, type PortalAccount } from '@/hooks/usePortalUserQuery';
import { useHeadshotQuery } from '@/hooks/useHeadshotQuery';

type PortalRole = 'exec' | 'applicant' | 'member';
type ApplicationViewStatus = 'NOT_STARTED' | 'DRAFT' | 'SUBMITTED';

function toPortalRole(type: PortalAccount['type']): PortalRole {
    if (type === 'LEADERSHIP') return 'exec';
    if (type === 'BROTHER' || type === 'ALUMNI') return 'member';
    return 'applicant';
}

function formatDate(dateLike: string | null): string {
    if (!dateLike) return '—';
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function HomePage() {
    const router = useRouter();

    const { data: sessionData, isFetching: sessionFetching } = useSessionQuery();
    const userId = sessionData?.user?.id ?? null;

    const { data: portalUserData, isFetching: portalUserFetching } = usePortalUserQuery(userId);
    const account = portalUserData?.data ?? null;

    const { data: headshotData } = useHeadshotQuery(userId);
    const headshotUrl = headshotData?.headshotBlobURL ?? null;

    const isLoading = sessionFetching || portalUserFetching;

    const role = useMemo<PortalRole>(() => toPortalRole(account?.type ?? null), [account?.type]);

    const fullName = useMemo(() => {
        if (!account) return '';
        return `${account.firstName} ${account.lastName}`.trim();
    }, [account]);

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800 transition-colors duration-300">
            <ThemeToggle />

            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo and Welcome */}
                    <div className="flex items-center gap-6">
                        <Image
                            src="KTPLettersW.svg"
                            alt="Kappa Theta Pi logo"
                            className="hidden dark:block"
                            width={100}
                            height={60}
                            priority
                        />
                        <Image
                            src="/KTPLetters.svg"
                            alt="Kappa Theta Pi logo"
                            className="block dark:hidden"
                            width={100}
                            height={60}
                        />
                        <div className="hidden sm:block h-8 w-px bg-gray-300 dark:bg-gray-700" />
                        <h1 className="text-xl font-semibold text-gray-900 hidden sm:block dark:text-white transition-colors duration-300">
                            Member Portal
                        </h1>
                    </div>

                    {/* User Info and Settings */}
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="flex items-center gap-3 cursor-pointer" aria-label="Go to profile">
                            <span className="h-10 w-10 rounded-full border-2 border-blue-200 dark:border-gray-600 overflow-hidden flex items-center justify-center bg-white/30 dark:bg-gray-800 transition-colors duration-300">
                                {headshotUrl ? (
                                    <Image
                                        src={headshotUrl}
                                        alt={fullName || 'Profile'}
                                        width={40}
                                        height={40}
                                        className="h-10 w-10 object-cover"
                                    />
                                ) : (
                                    <User className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                                )}
                            </span>

                            <span className="text-sm font-medium text-gray-700 hidden md:block dark:text-white transition-colors duration-300">
                                {isLoading ? 'Loading…' : fullName || 'User'}
                            </span>
                        </Link>

                        <button
                            onClick={() => router.push('/portal/settings')}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            aria-label="Settings"
                            type="button"
                        >
                            <svg
                                className="w-5 h-5 text-gray-600 dark:text-white transition-colors duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
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

                {/* Welcome Section */}
                {userId ? (
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                            Welcome, {isLoading ? '…' : `${firstName}`}!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {role === 'exec' ? 'Manage applications and chapter roster from your dashboard.' : 'Track your application status and stay updated.'}
                        </p>
                    </div>
                ) : null}

                {/* Applicant View */}
                {userId && role === 'applicant' ? (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                            Your Application
                        </h3>

                        <div
                            onClick={() => router.push('/application/view')}
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
                                                ? `Submitted on ${formatDate(account?.applications?.submittedAt ?? null)}`
                                                : appStatus === 'DRAFT'
                                                    ? `Created on ${formatDate(account?.applications?.createdAt ?? null)}`
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

                {/* Exec View */}
                {userId && role === 'exec' ? (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                            Executive Dashboard
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            <button
                                onClick={() => router.push('/exec/applicants')}
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
                                onClick={() => router.push('/exec/roster')}
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

                {/* Member View */}
                {userId && role === 'member' ? (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                            Member Dashboard
                        </h3>
                    </div>
                ) : null}
            </main>
        </div>
    );
}
