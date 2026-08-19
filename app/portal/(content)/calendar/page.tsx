"use client";

import Link from "next/link";

import { useSessionQuery } from "@/client/hooks/auth";
import { useMyAccountQuery } from "@/client/hooks/accounts";
import { Card, CardContent } from "@/components/ui/card";
import GoogleCalendarEmbed from "@/components/GoogleCalendarEmbed";

// Keep in sync with app/api/authz/calendar/route.ts: members (brothers,
// exec/leadership, alumni) and rushees (PNMs) can see the chapter calendar.
// Applicants who haven't received a bid yet cannot.
const CALENDAR_ALLOWED_TYPES = new Set(["BROTHER", "LEADERSHIP", "ALUMNI", "PNM"]);

export default function PortalCalendarPage() {
    const session = useSessionQuery();
    const account = useMyAccountQuery();

    const userId = session.data?.user?.id ?? null;
    const accountType = account.data?.type ?? null;
    const isGateLoading = session.isFetching || (userId ? account.isFetching : false);
    const isAllowed = Boolean(accountType) && CALENDAR_ALLOWED_TYPES.has(accountType as string);

    return (
        <main className="max-w-5xl mx-auto px-6 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                    Chapter Calendar
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Keep up with chapter events, meetings, and opportunities.
                </p>
            </div>

            {!userId && !session.isFetching ? (
                <Card className="bg-white border border-gray-200 rounded-xl shadow-md dark:bg-gray-900 dark:border-gray-700">
                    <CardContent className="p-6 space-y-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Sign in to view the chapter calendar.
                        </div>
                        <Link className="text-sm text-blue-600 hover:text-blue-700" href="/auth/sign-in">
                            Go to sign in
                        </Link>
                    </CardContent>
                </Card>
            ) : isGateLoading ? (
                <Card className="bg-white border border-gray-200 rounded-xl shadow-md dark:bg-gray-900 dark:border-gray-700">
                    <CardContent className="p-6 text-sm text-gray-600 dark:text-gray-400">
                        Checking access...
                    </CardContent>
                </Card>
            ) : !isAllowed ? (
                <Card className="bg-white border border-gray-200 rounded-xl shadow-md dark:bg-gray-900 dark:border-gray-700">
                    <CardContent className="p-6 text-sm text-gray-600 dark:text-gray-400">
                        The chapter calendar is available to members and rushees. If you think this is a
                        mistake, reach out to exec.
                    </CardContent>
                </Card>
            ) : (
                <GoogleCalendarEmbed />
            )}
        </main>
    );
}
