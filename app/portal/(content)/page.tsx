// app/portal/page.tsx
"use client";

import {
  BadgeCheck,
  ChevronRight,
  ListPlus,
  CalendarPlus,
  Plus,
  ListChecks,
} from "lucide-react";
import { type as AccountType, applicationStatus, Prisma } from "@prisma/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useMyAccountQuery } from "@/client/hooks/accounts";
import { useSessionQuery } from "@/client/hooks/auth";
import { hasExecAccess } from "@/lib/auth/roles";
import confetti from "canvas-confetti";

import { useMyApplications } from "@/hooks/useMyApplications";

import { Application } from "./components/application";

type PortalRole = "exec" | "applicant" | "member" | "pnm";

// ✅ new: can be "not started", "in progress", or the submitted status enum
type ApplicationViewStatus = "NOT_STARTED" | "IN_PROGRESS" | applicationStatus;

function toPortalRole(typeValue: AccountType | null | undefined): PortalRole {
  if (hasExecAccess(typeValue)) return "exec";
  if (typeValue === "BROTHER" || typeValue === "ALUMNI") return "member";
  if (typeValue === "PNM") return "pnm";
  return "applicant";
}

const roleMessages = {
  exec: "Manage applications and chapter roster from your dashboard.",
  member: "Vote on fraternity matters and update your profile.",
  applicant: "Track your application status and stay updated.",
  pnm: "Track your pledge requirements and stay on top of your progress.",
};

// Shared "Chapter Calendar" dashboard card — kept in sync with
// app/api/authz/calendar/route.ts: members (brothers, exec/leadership,
// alumni) and rushees (PNMs) can see the chapter calendar, so this card only
// appears in the exec, member, and pnm dashboard sections below.
function ChapterCalendarCard() {
  return (
    <Link
      href="/portal/calendar"
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
          <svg
            className="w-6 h-6 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <svg
          className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
        Chapter Calendar
      </h4>
      <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
        Keep up with chapter events, meetings, and opportunities.
      </p>
    </Link>
  );
}

export default function PortalHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = useMemo(
    () => searchParams.get("redirectTo") ?? "/portal",
    [searchParams],
  );

  // sources of truth
  const session = useSessionQuery();
  const userId = session.data?.user?.id ?? null;

  const account = useMyAccountQuery();

  const isLoading = session.isFetching || account.isFetching;

  const role = useMemo<PortalRole>(
    () => toPortalRole(account.data?.type ?? null),
    [account.data?.type],
  );
  const firstName = useMemo(
    () => account.data?.firstName?.trim() || "there",
    [account.data?.firstName],
  );

  const {
    applications,
    loading: applicationsLoading,
    createApplication,
  } = useMyApplications();

  const statusChipRef = useRef<HTMLSpanElement | null>(null);

  const app = (account.data as any)?.applications ?? null;

  // ✅ updated status logic
  const appStatus = useMemo<ApplicationViewStatus>(() => {
    if (!app) return "NOT_STARTED";

    // once submitted, show the real workflow status
    if (app.submittedAt)
      return (app.status as applicationStatus) ?? "UNDER_REVIEW";

    // ✅ your rule: any change reflected by lastModified => in progress
    // (note: lastModified will be present as soon as the row exists, IF it’s selected by the API)
    if (app.lastModified) return "IN_PROGRESS";

    return "NOT_STARTED";
  }, [account.data]);

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
      ticks: 200,
    });
  }, [appStatus]);

  const [tooManyApplications, setTooManyApplications] = useState(false);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 bg-transparent transition-colors duration-300">
      {/* signed out */}
      {!userId && !session.isFetching ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            You’re not signed in
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sign in to access the portal.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() =>
                router.push(
                  `/auth/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`,
                )
              }
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
              type="button"
            >
              Sign In
            </button>
            <button
              onClick={() =>
                router.push(
                  `/auth/sign-up?redirectTo=${encodeURIComponent(redirectTo)}`,
                )
              }
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
            Welcome, {isLoading ? "…" : firstName}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {roleMessages[role] || roleMessages.applicant}
          </p>
        </div>
      ) : null}

      {/* applicant view */}
      {userId && role === "applicant" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
              Your Application
            </h3>
            <button
              onClick={() => {
                if (applications.length > 1) {
                  setTooManyApplications(true);
                } else {
                  createApplication();
                }
              }}
              className="bg-blue-500 text-xl cursor-pointer rounded-full p-2 text-white flex gap-2 items-center"
            >
              Create New Application
              <Plus />
            </button>
          </div>
          {!applicationsLoading &&
            applications.map((app) => (
              <Application key={app.id} application={app} />
            ))}
          {tooManyApplications && (
            <div
              className="absolute inset-0 bg-black/20 items-center flex justify-items-center"
              onClick={() => setTooManyApplications(false)}
            >
              <div className=" bg-white p-4 rounded-md m-auto h-1/4 items-center flex text-2xl">
                <p> At this time applicants can only apply to KTP twice</p>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* exec view */}
      {userId && role === "exec" ? (
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
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                View Current Applicants
              </h4>
              <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                Review and manage all applications for the Spring 2026
                recruitment cycle.
              </p>
            </Link>

            <Link
              href="/portal/exec/modify-roster"
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
              aria-label="Modify Chapter Roster"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                Modify Chapter Roster
              </h4>
              <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                Update member information and manage the active chapter roster.
              </p>
            </Link>

            <Link
              href="/portal/exec/voting"
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                Run Chapter Voting
              </h4>
              <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                Create questions, set eligibility, and view live results.
              </p>
            </Link>

            <Link
              href="/portal/voting"
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12h5l4 8 4-16 3 8h2"
                    />
                  </svg>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                Vote
              </h4>
              <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                Vote on active questions when in session.
              </p>
            </Link>

            <Link
              href="/portal/career-center"
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                Career Center
              </h4>
            </Link>
            <Link
              href="/portal/active-points"
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-teal-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-teal-100 rounded-lg group-hover:bg-teal-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                  <BadgeCheck />
                </div>
                <ChevronRight className="text-gray-400 text-light group-hover:text-teal-300" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                Active Points
              </h4>
              <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                Track your active requirements and event attendance.
              </p>
            </Link>

            <Link
              href="/portal/exec/member-progress"
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <ListChecks className="p-3 w-12 h-auto text-green-700 bg-green-100 rounded-lg group-hover:bg-green-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors" />
                <ChevronRight className="text-slate-400 group-hover:text-blue-500" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                Member Progress
              </h4>
              <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                Track Fall 2026 points and requirement completion across the chapter.
              </p>
            </Link>

            <Link
              href="/portal/exec/requirements"
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <ListPlus className="p-3 w-12 h-auto text-green-700 bg-green-100 rounded-lg group-hover:bg-green-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors" />
                <ChevronRight className="text-slate-400 group-hover:text-blue-500" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                Requirements
              </h4>
              <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                Create new requirements for actives, pledges and rushees.
              </p>
            </Link>

            <Link
              href="/portal/exec/events"
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <CalendarPlus className="p-3 w-12 h-auto text-green-700 bg-green-100 rounded-lg group-hover:bg-green-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors" />
                <ChevronRight className="text-slate-400 group-hover:text-blue-500" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                Events
              </h4>
              <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                Create new events for actives, pledges and rushees.
              </p>
            </Link>

            <ChapterCalendarCard />
          </div>
        </div>
      ) : null}

      {/* pnm view */}
      {userId && role === "pnm" ? (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
            Pledge Dashboard
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/portal/pledge-points"
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-teal-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-teal-100 rounded-lg group-hover:bg-teal-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                  <svg
                    className="w-6 h-6 text-teal-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                Pledge Points
              </h4>
              <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                Track your pledge requirements and event attendance.
              </p>
            </Link>

            <ChapterCalendarCard />
          </div>
        </div>
      ) : null}

      {/* member view */}
      {userId && role === "member" ? (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
            Member Dashboard
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/portal/rushees"
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16h8M8 12h8m-6-8h4a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2h4z"
                    />
                  </svg>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                Rushees
              </h4>
              <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                Leave impressions and notes on applicants.
              </p>
            </Link>
            <Link
              href="/portal/voting"
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12h5l4 8 4-16 3 8h2"
                    />
                  </svg>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                Chapter Voting
              </h4>
              <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                Vote on active questions when in session.
              </p>
            </Link>
            <Link
              href="/portal/career-center"
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                Active Member Points
              </h4>
              <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                Track your semester requirements and event attendance.
              </p>

              <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                Career Center
              </h4>
            </Link>

            <ChapterCalendarCard />
          </div>
        </div>
      ) : null}
    </main>
  );
}
