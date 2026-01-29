// app/portal/page.tsx
"use client";

import type { type as AccountType, applicationStatus } from "@prisma/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { useMyAccountQuery } from "@/client/hooks/accounts";
import { useSessionQuery } from "@/client/hooks/auth";
import confetti from "canvas-confetti";

type PortalRole = "exec" | "applicant" | "member";

// ✅ new: can be "not started", "in progress", or the submitted status enum
type ApplicationViewStatus = "NOT_STARTED" | "IN_PROGRESS" | applicationStatus;

function toPortalRole(typeValue: AccountType | null | undefined): PortalRole {
    if (typeValue === "LEADERSHIP") return "exec";
    if (typeValue === "BROTHER" || typeValue === "ALUMNI") return "member";
    return "applicant";
}

function formatDate(dateLike: string | Date | null | undefined): string {
    if (!dateLike) return "—";
    const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function statusLabel(status: ApplicationViewStatus): string {
    if (status === "NOT_STARTED") return "Not Started";
    if (status === "IN_PROGRESS") return "In Progress";

    switch (status) {
        case "UNDER_REVIEW":
            return "Under Review";
        case "INTERVIEW":
            return "Interview";
        case "WAITLIST":
            return "Waitlist";
        case "BID_OFFERED":
            return "Bid Offered";
        case "BID_DECLINED":
            return "Bid Declined";
        case "BID_ACCEPTED":
            return "Bid Accepted";
        case "CLOSED":
            return "Closed";
        default:
            return String(status);
    }
}

function statusPillClasses(status: ApplicationViewStatus): string {
    if (status === "NOT_STARTED") return "bg-gray-100 text-gray-800 border-gray-200";
    if (status === "IN_PROGRESS") return "bg-yellow-100 text-yellow-800 border-yellow-200";

    switch (status) {
        case "BID_ACCEPTED":
            return "bg-green-100 text-green-800 border-green-200";
        case "BID_OFFERED":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "INTERVIEW":
            return "bg-purple-100 text-purple-800 border-purple-200";
        case "WAITLIST":
            return "bg-orange-100 text-orange-800 border-orange-200";
        case "BID_DECLINED":
            return "bg-red-100 text-red-800 border-red-200";
        case "CLOSED":
            return "bg-gray-200 text-gray-900 border-gray-300";
        case "UNDER_REVIEW":
        default:
            return "bg-slate-100 text-slate-800 border-slate-200";
    }
}

const roleMessages = {
    exec: "Manage applications and chapter roster from your dashboard.",
    member: "Vote on fraternity matters and update your profile.",
    applicant: "Track your application status and stay updated.",
};

export default function PortalHomePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const redirectTo = useMemo(() => searchParams.get("redirectTo") ?? "/portal", [searchParams]);

    // sources of truth
    const session = useSessionQuery();
    const userId = session.data?.user?.id ?? null;

    const account = useMyAccountQuery();

    const isLoading = session.isFetching || account.isFetching;

    const role = useMemo<PortalRole>(() => toPortalRole(account.data?.type ?? null), [account.data?.type]);
    const firstName = useMemo(() => account.data?.firstName?.trim() || "there", [account.data?.firstName]);

    const statusChipRef = useRef<HTMLSpanElement | null>(null);

    const app = (account.data as any)?.applications ?? null;

    // ✅ updated status logic
    const appStatus = useMemo<ApplicationViewStatus>(() => {
        if (!app) return "NOT_STARTED";

        // once submitted, show the real workflow status
        if (app.submittedAt) return (app.status as applicationStatus) ?? "UNDER_REVIEW";

        // ✅ your rule: any change reflected by lastModified => in progress
        // (note: lastModified will be present as soon as the row exists, IF it’s selected by the API)
        if (app.lastModified) return "IN_PROGRESS";

        return "NOT_STARTED";
    }, [account.data]);

    // choose where the application card should send the user
    const applicationHref = useMemo(() => {
        // safest: use the actual stored status if it exists,
        // otherwise fall back to the derived view status
        const rawStatus = (app as any)?.status as applicationStatus | undefined;

        const effectiveStatus =
            rawStatus ?? (appStatus !== "NOT_STARTED" && appStatus !== "IN_PROGRESS" ? appStatus : undefined);

        return effectiveStatus === "BID_OFFERED" ? "/portal/bid-letter" : "/portal/application";
    }, [app, appStatus]);

    useEffect(() => {
        if (appStatus !== "BID_ACCEPTED") return;

        const shouldCelebrate = sessionStorage.getItem("showBidAcceptedConfetti");
        if (!shouldCelebrate) return;

        sessionStorage.removeItem("showBidAcceptedConfetti");

        const el = statusChipRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
            particleCount: 120,
            spread: 70,
            origin: { x, y },
            startVelocity: 45,
            gravity: 0.9,
            ticks: 200
        });
    }, [appStatus]);

    return (
        <main className="max-w-7xl mx-auto px-6 py-8 bg-transparent transition-colors duration-300">
            {/* signed out */ }
            { !userId && !session.isFetching ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You’re not signed in</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Sign in to access the portal.</p>
                    <div className="flex gap-2">
                        <button
                            onClick={ () => router.push(`/auth/sign-in?redirectTo=${ encodeURIComponent(redirectTo) }`) }
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                            type="button"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={ () => router.push(`/auth/sign-up?redirectTo=${ encodeURIComponent(redirectTo) }`) }
                            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            type="button"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            ) : null }

            {/* welcome */ }
            { userId ? (
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                        Welcome, { isLoading ? "…" : firstName }!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {roleMessages[role] || roleMessages.applicant}
                    </p>
                </div>
            ) : null }

            {/* applicant view */ }
            { userId && role === "applicant" ? (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">Your
                        Application</h3>

                    <div
                        onClick={ () => router.push(applicationHref) }
                        className="bg-white rounded-xl shadow-md hover:shadow-lg dark:bg-gray-900 dark:border-gray-600 dark:hover:border-gray-400 transition-all cursor-pointer border border-gray-200 overflow-hidden group"
                        role="button"
                        tabIndex={ 0 }
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between gap-6 mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                                            Spring 2026 Application
                                        </h4>

                                        <span
                                            ref={ statusChipRef }
                                            className={ `px-3 py-1 rounded-full text-xs font-medium border ${ statusPillClasses(appStatus) }` }
                                        >
                                            { statusLabel(appStatus) }
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                        { appStatus === "NOT_STARTED"
                                            ? "Not started yet"
                                            : app?.submittedAt
                                                ? `Submitted on ${ formatDate(app.submittedAt) }`
                                                : `Last saved on ${ formatDate(app?.lastModified ?? app?.createdAt) }` }
                                    </p>
                                </div>

                                <div className="flex gap-6 text-left">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-white transition-colors duration-300">Major</p>
                                        <p className="text-sm mt-2 font-medium text-gray-900 dark:text-gray-300 transition-colors duration-300">
                                            { app?.major ?? "—" }
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-white transition-colors duration-300">Year</p>
                                        <p className="text-sm mt-2 font-medium text-gray-900 dark:text-gray-300 transition-colors duration-300">
                                            { app?.classification ?? "—" }
                                        </p>
                                    </div>
                                </div>

                                {/* Arrow */ }
                                <svg
                                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 }
                                          d="M9 5l7 7-7 7"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null }

            {/* exec view */ }
            { userId && role === "exec" ? (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                        Executive Dashboard
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Link
                            href="/portal/exec/applications"
                            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
                            aria-label="View Spring 2026 Applicants"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={ 2 }
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                                View Spring 2026 Applicants
                            </h4>
                            <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                                Review and manage all applications for the Spring 2026 recruitment cycle.
                            </p>
                        </Link>

                        <Link
                            href="/portal/exec/modify-roster"
                            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
                            aria-label="Modify Chapter Roster"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={ 2 }
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                                Modify Chapter Roster
                            </h4>
                            <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                                Update member information and manage the active chapter roster.
                            </p>
                        </Link>

                        <Link href="/portal/exec/voting" className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={ 2 }
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                        />
                                    </svg>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 }
                                          d="M9 5l7 7-7 7"/>
                                </svg>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                                Run Chapter Voting
                            </h4>
                            <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                                Create questions, set eligibility, and view live results.
                            </p>
                        </Link>

                        <Link href="/portal/voting" className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={ 2 }
                                            d="M3 12h5l4 8 4-16 3 8h2"
                                        />
                                    </svg>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 }
                                          d="M9 5l7 7-7 7"/>
                                </svg>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                                Vote
                            </h4>
                            <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                                Vote on active questions when in session.
                            </p>
                        </Link>
                    </div>
                </div>
            ) : null }

            {/* member view */ }
            { userId && role === "member" ? (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">Member
                        Dashboard</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Link href="/portal/voting" className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={ 2 }
                                            d="M3 12h5l4 8 4-16 3 8h2"
                                        />
                                    </svg>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 }
                                          d="M9 5l7 7-7 7"/>
                                </svg>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                                Chapter Voting
                            </h4>
                            <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                                Vote on active questions when in session.
                            </p>
                        </Link>
                    </div>
                </div>
            ) : null }
        </main>
    );
}
