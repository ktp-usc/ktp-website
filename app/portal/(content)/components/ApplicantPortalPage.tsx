"use client";

import { CircleAlert, Plus, X } from "lucide-react";
import { applicationStatus } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";

import { useMyApplications } from "@/hooks/useMyApplications";
import {
  APPLICATION_FOR_SEMESTER_EXISTS,
  APPLICATION_LIMIT_REACHED,
  MAX_APPLICATIONS_PER_USER,
} from "@/lib/applications";
import { portalHomePath } from "@/lib/auth/roles";

import { Application } from "./application";
import { usePortalSession } from "../hooks/usePortalSession";

type ApplicationViewStatus = "NOT_STARTED" | "IN_PROGRESS" | applicationStatus;

export default function ApplicantPortalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = useMemo(
    () => searchParams.get("redirectTo") ?? "/portal",
    [searchParams],
  );

  const { session, account, userId, isLoading, type, firstName, role } =
    usePortalSession();

  const {
    applications,
    loading: applicationsLoading,
    createApplication,
  } = useMyApplications();

  const statusChipRef = useRef<HTMLSpanElement | null>(null);

  const app =
    (
      account.data as
        | {
            applications?: {
              submittedAt?: Date | string | null;
              lastModified?: Date | string | null;
              status?: applicationStatus;
            } | null;
          }
        | undefined
    )?.applications ?? null;

  const appStatus = useMemo<ApplicationViewStatus>(() => {
    if (!app) return "NOT_STARTED";
    if (app.submittedAt)
      return (app.status as applicationStatus) ?? "UNDER_REVIEW";
    if (app.lastModified) return "IN_PROGRESS";
    return "NOT_STARTED";
  }, [app]);

  useEffect(() => {
    if (isLoading || !userId) return;
    if (role !== "applicant") {
      router.replace(portalHomePath(type));
    }
  }, [isLoading, userId, role, type, router]);

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

  const [applicationError, setApplicationError] = useState<string | null>(null);

  if (userId && (isLoading || role !== "applicant")) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-gray-600 dark:text-gray-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 bg-transparent transition-colors duration-300">
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

      {userId ? (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
            Welcome, {isLoading ? "…" : firstName}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your application status and stay updated.
          </p>
        </div>
      ) : null}

      {userId && role === "applicant" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
              Your Application
            </h3>
            <button
              onClick={async () => {
                if (applications.length >= MAX_APPLICATIONS_PER_USER) {
                  setApplicationError(
                    `At this time applicants can only apply to KTP ${MAX_APPLICATIONS_PER_USER} times`,
                  );
                  return;
                }
                try {
                  await createApplication();
                } catch (error) {
                  if (!(error instanceof Error)) return;
                  if (error.message === APPLICATION_LIMIT_REACHED) {
                    setApplicationError(
                      `At this time applicants can only apply to KTP ${MAX_APPLICATIONS_PER_USER} times`,
                    );
                  } else if (
                    error.message === APPLICATION_FOR_SEMESTER_EXISTS ||
                    error.message === "application_already_exists"
                  ) {
                    setApplicationError("One application per semester");
                  }
                }
              }}
              className="bg-blue-500 text-xl cursor-pointer rounded-full p-2 text-white flex gap-2 items-center"
            >
              Create New Application
              <Plus />
            </button>
          </div>
          {!applicationsLoading &&
            applications.map((application) => (
              <Application key={application.id} application={application} />
            ))}
          {applicationError && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[2px]"
              onClick={() => setApplicationError(null)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="application-error-title"
            >
              <div
                className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-900"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-gray-700">
                    <CircleAlert className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h4
                        id="application-error-title"
                        className="text-lg font-semibold text-gray-900 dark:text-white"
                      >
                        Unable to create application
                      </h4>
                      <button
                        type="button"
                        onClick={() => setApplicationError(null)}
                        className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        aria-label="Close"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {applicationError}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setApplicationError(null)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </main>
  );
}
