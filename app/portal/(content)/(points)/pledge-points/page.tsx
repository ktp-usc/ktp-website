"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMyAccountQuery } from "@/client/hooks/accounts";
import { useSessionQuery } from "@/client/hooks/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { canAccessPledgePoints } from "@/lib/auth/roles";
import { RequirementProgressList } from "../RequirementProgressList";
import { usePoints } from "../usePoints";

const SEMESTER_LABEL = "Spring 2026";

export default function ActiveMemberPointsPage() {
  const router = useRouter();
  const session = useSessionQuery();
  const account = useMyAccountQuery();
  const [attendanceCode, setAttendanceCode] = useState("");

  const isLoading = session.isFetching || account.isFetching;

  const isAuthorized = useMemo(() => {
    const t = account.data?.type;
    return canAccessPledgePoints(t);
  }, [account.data?.type]);

  const fullName = useMemo(() => {
    const first = account.data?.firstName?.trim() ?? "";
    const last = account.data?.lastName?.trim() ?? "";
    return first || last ? `${first} ${last}`.trim() : null;
  }, [account.data]);

  const {
    requirementProgressData,
    loading: requirementProgressLoading,
    setAccountId,
    updateAttendance,
    attendance,
    events,
  } = usePoints(false);

  useEffect(() => {
    if (!isLoading && (!session.data?.user?.id || !isAuthorized)) {
      router.replace("/portal");
    }
    if (!isLoading && session.data?.user?.id) {
      setAccountId(session.data.user.id);
    }
  }, [isLoading, session.data?.user?.id, isAuthorized, router]);

  if (isLoading || requirementProgressLoading) {
    return (
      <main className="max-w-6xl mx-auto px-8 py-14">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          <div className="space-y-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-52 w-full rounded-2xl" />
            <Skeleton className="h-32 rounded-xl" />
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

  return (
    <main className="max-w-6xl mx-auto px-8 py-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
        {/* LEFT COLUMN – stats */}
        <div className="space-y-8 mb-12 lg:mb-0 lg:sticky lg:top-8">
          {/* Page header */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Badge className="rounded-full px-3.5 py-1.5 text-sm bg-[#1e2d5a] text-white border-transparent hover:bg-[#1e2d5a]">
                Active Member
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full px-3.5 py-1.5 text-sm"
              >
                {SEMESTER_LABEL}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Active Member Points
            </h1>
            {fullName && (
              <p className="text-base text-gray-400 dark:text-gray-500 mt-2">
                Signed in as{" "}
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {fullName}
                </span>
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
                className="font-bold leading-none tabular-nums text-[#1e2d5a] dark:text-indigo-400"
                style={{ fontSize: "7rem" }}
              >
                {requirementProgressData.totalPoints}
              </p>
              <p className="text-base text-gray-400 dark:text-gray-500 mt-4">
                Approved this semester
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="px-7 py-6 pt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
                Requirements
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {requirementProgressData
                    ? requirementProgressData.categoriesCompleted
                    : "0"}
                </span>
                <span className="text-2xl font-medium text-gray-300 dark:text-gray-600 tabular-nums">
                  /{" "}
                  {requirementProgressData
                    ? requirementProgressData.totalCategories
                    : "0"}
                </span>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                categories completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN – requirement progress */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6">
              Enter Attendance Code
            </h2>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 shadow-lg p-8 space-y-6">
              <input
                type="text"
                placeholder="Enter attendance code"
                value={attendanceCode}
                onChange={(e) => {
                  setAttendanceCode(e.target.value);
                }}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#1e2d5a] dark:focus:ring-indigo-500"
              />

              <button
                onClick={() => {
                  updateAttendance(attendanceCode);
                  setAttendanceCode("");
                }}
                className="w-full rounded-lg bg-[#1e2d5a] py-3 text-white font-semibold transition-colors hover:bg-[#2c417d] disabled:opacity-50"
              >
                Enter Code
              </button>
            </div>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6">
              Requirement Progress
            </h2>

            <RequirementProgressList
              items={requirementProgressData.pointRequirementProgress}
              events={events}
              attendance={attendance}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
