"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMyAccountQuery } from "@/client/hooks/accounts";
import { useSessionQuery } from "@/client/hooks/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const SEMESTER_LABEL = "Spring 2026";
const TOTAL_POINTS = 13;
const PENDING_POINTS = 5;

const CATEGORIES = [
    { name: "Coffee Chats",             completed: 3, required: 5, ptsEarned: 3 },
    { name: "Workshops",                completed: 3, required: 3, ptsEarned: 6 },
    { name: "Social Events",            completed: 1, required: 2, ptsEarned: 2 },
    { name: "Hackathons / Conferences", completed: 0, required: 1, ptsEarned: 0 },
    { name: "Big/Little Hangout",       completed: 1, required: 1, ptsEarned: 2 },
];

const REQUIREMENTS_COMPLETED = CATEGORIES.filter(
    (c) => c.completed >= c.required
).length;

export default function PnmPledgePointsPage() {
    const router = useRouter();
    const session = useSessionQuery();
    const account = useMyAccountQuery();

    const isLoading = session.isFetching || account.isFetching;

    const isAuthorized = useMemo(() => {
        return account.data?.type === "PNM";
    }, [account.data?.type]);

    const fullName = useMemo(() => {
        const first = account.data?.firstName?.trim() ?? "";
        const last  = account.data?.lastName?.trim()  ?? "";
        return first || last ? `${first} ${last}`.trim() : null;
    }, [account.data]);

    if (isLoading) {
        return (
            <main className="max-w-6xl mx-auto px-8 py-14">
                <div className="lg:grid lg:grid-cols-2 lg:gap-12">
                    <div className="space-y-8">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-52 w-full rounded-2xl" />
                        <div className="grid grid-cols-2 gap-5">
                            <Skeleton className="h-32 rounded-xl" />
                            <Skeleton className="h-32 rounded-xl" />
                        </div>
                    </div>
                    <div className="space-y-5 mt-8 lg:mt-0">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-36 rounded-xl" />
                        <Skeleton className="h-36 rounded-xl" />
                        <Skeleton className="h-36 rounded-xl" />
                    </div>
                </div>
            </main>
        );
    }

    if (!session.data?.user?.id) {
        router.replace("/portal");
        return null;
    }

    if (!isAuthorized) {
        router.replace("/portal");
        return null;
    }

    return (
        <main className="max-w-6xl mx-auto px-8 py-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">

                {/* LEFT COLUMN – stats */}
                <div className="space-y-8 mb-12 lg:mb-0 lg:sticky lg:top-8">

                    {/* Page header */}
                    <div>
                        <div className="flex items-center gap-2 mb-5">
                            <Badge className="rounded-full px-3.5 py-1.5 text-sm bg-[#1e5a4a] text-white border-transparent hover:bg-[#1e5a4a]">
                                Pledge
                            </Badge>
                            <Badge variant="secondary" className="rounded-full px-3.5 py-1.5 text-sm">
                                {SEMESTER_LABEL}
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Pledge Points
                        </h1>
                        {fullName && (
                            <p className="text-base text-gray-400 dark:text-gray-500 mt-2">
                                Signed in as{" "}
                                <span className="font-medium text-gray-600 dark:text-gray-300">{fullName}</span>
                            </p>
                        )}
                    </div>

                    {/* Hero metric – Total Points */}
                    <Card>
                        <CardContent className="px-10 py-10 pt-10">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-5">
                                Total Points
                            </p>
                            <p
                                className="font-bold leading-none tabular-nums text-[#1e5a4a] dark:text-teal-400"
                                style={{ fontSize: "7rem" }}
                            >
                                {TOTAL_POINTS}
                            </p>
                            <p className="text-base text-gray-400 dark:text-gray-500 mt-4">
                                Approved this semester
                            </p>
                        </CardContent>
                    </Card>

                    {/* Secondary stats */}
                    <div className="grid grid-cols-2 gap-5">
                        <Card>
                            <CardContent className="px-7 py-6 pt-6">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
                                    Requirements
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold text-gray-900 dark:text-white tabular-nums">
                                        {REQUIREMENTS_COMPLETED}
                                    </span>
                                    <span className="text-2xl font-medium text-gray-300 dark:text-gray-600 tabular-nums">
                                        / {CATEGORIES.length}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">categories completed</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="px-7 py-6 pt-6">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
                                    Pending
                                </p>
                                <p className="text-5xl font-bold text-gray-900 dark:text-white tabular-nums">
                                    {PENDING_POINTS}
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">points awaiting approval</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* RIGHT COLUMN – requirement progress */}
                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6">
                        Requirement Progress
                    </h2>

                    <div className="space-y-5 lg:overflow-y-auto lg:pr-2 lg:pb-4 lg:max-h-[calc(100vh-14rem)]">
                        {CATEGORIES.map((cat) => {
                            const pct        = cat.required > 0 ? Math.min(Math.round((cat.completed / cat.required) * 100), 100) : 0;
                            const isComplete = cat.completed >= cat.required;
                            const isMissing  = cat.completed === 0;

                            let cardClass: string;
                            if (isComplete) {
                                cardClass = "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900";
                            } else if (isMissing) {
                                cardClass = "border-l-4 border-l-rose-500 dark:border-l-rose-400";
                            } else {
                                cardClass = "border-l-4 border-l-[#1e5a4a] dark:border-l-teal-400";
                            }

                            return (
                                <Card key={cat.name} className={cardClass}>
                                    <CardContent className="px-7 py-6 pt-6">
                                        {/* Card header */}
                                        <div className="flex items-start justify-between gap-4 mb-6">
                                            <p className={`text-base leading-snug ${
                                                isComplete
                                                    ? "font-semibold text-green-900 dark:text-green-300"
                                                    : "font-bold text-gray-900 dark:text-white"
                                            }`}>
                                                {cat.name}
                                            </p>

                                            {isComplete ? (
                                                <Badge className="shrink-0 rounded-full gap-1.5 px-3 py-1.5 text-sm bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-transparent hover:bg-green-100">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Complete
                                                </Badge>
                                            ) : isMissing ? (
                                                <Badge className="shrink-0 rounded-full gap-1.5 px-3 py-1.5 text-sm bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-transparent hover:bg-rose-100">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                                    </svg>
                                                    Missing
                                                </Badge>
                                            ) : (
                                                <Badge className="shrink-0 rounded-full gap-1.5 px-3 py-1.5 text-sm bg-[rgba(30,90,74,0.08)] text-[#1e5a4a] dark:bg-teal-950/50 dark:text-teal-400 border-transparent hover:bg-[rgba(30,90,74,0.08)]">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    In Progress
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Progress lane */}
                                        <div>
                                            <p className={`text-sm font-semibold tabular-nums text-right mb-2 ${
                                                isComplete
                                                    ? "text-green-700 dark:text-green-400"
                                                    : isMissing
                                                        ? "text-rose-600 dark:text-rose-400"
                                                        : "text-[#1e5a4a] dark:text-teal-400"
                                            }`}>
                                                {cat.completed} / {cat.required}
                                            </p>

                                            <div className={`w-full rounded-full h-4 overflow-hidden ${
                                                isComplete
                                                    ? "bg-green-100 dark:bg-green-950"
                                                    : isMissing
                                                        ? "bg-rose-100 dark:bg-rose-950"
                                                        : "bg-gray-100 dark:bg-gray-800"
                                            }`}>
                                                <div
                                                    className={`h-4 rounded-full transition-all duration-700 bg-gradient-to-r ${
                                                        isComplete
                                                            ? "from-green-700 to-green-500"
                                                            : isMissing
                                                                ? "from-rose-400 to-rose-300"
                                                                : "from-[#1e5a4a] to-[#2d8c6e] dark:from-teal-600 dark:to-teal-400"
                                                    }`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>

                                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 text-right">
                                                {pct}% complete
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

            </div>
        </main>
    );
}
