"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  canAccessLeadershipDashboard,
  portalHomePath,
} from "@/lib/auth/roles";
import { DashboardGrid } from "../components/DashboardCard";
import {
  ActivePointsCard,
  CareerCenterCard,
  EngagementGroup,
  RosterManagementGroup,
  VoteGroup,
} from "../components/portalCards";
import { usePortalSession } from "../hooks/usePortalSession";
import { CurrentSemesterInput } from "./CurrentSemesterInput";

export default function LeadershipPage() {
  const router = useRouter();
  const { userId, isLoading, type, firstName } = usePortalSession();
  const allowed = canAccessLeadershipDashboard(type);

  useEffect(() => {
    if (isLoading) return;
    if (!allowed) router.replace(portalHomePath(type));
  }, [isLoading, allowed, type, router]);

  if (isLoading || !userId || !allowed) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-gray-600 dark:text-gray-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 bg-transparent transition-colors duration-300">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
            Welcome, {firstName}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage applications and chapter roster from your dashboard.
          </p>
        </div>
        <CurrentSemesterInput />
      </div>

      <div className="space-y-10">
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
            Management
          </h3>
          <DashboardGrid>
            <RosterManagementGroup />
            <VoteGroup />
            <EngagementGroup />
          </DashboardGrid>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
            Personal
          </h3>
          <DashboardGrid>
            <CareerCenterCard />
            <ActivePointsCard />
          </DashboardGrid>
        </section>
      </div>
    </main>
  );
}
