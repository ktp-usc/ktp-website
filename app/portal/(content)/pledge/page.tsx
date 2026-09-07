"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { canAccessPledgeDashboard, portalHomePath } from "@/lib/auth/roles";
import { DashboardGrid } from "../components/DashboardCard";
import {
  ChapterCalendarCard,
  PledgePointsCard,
  VoteCard,
} from "../components/portalCards";
import { usePortalSession } from "../hooks/usePortalSession";

export default function PledgePage() {
  const router = useRouter();
  const { userId, isLoading, type, firstName } = usePortalSession();
  const allowed = canAccessPledgeDashboard(type);

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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
          Welcome, {firstName}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your pledge requirements and stay on top of your progress.
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
          Pledge Dashboard
        </h3>
        <DashboardGrid>
          <PledgePointsCard />
          <ChapterCalendarCard />
          <VoteCard />
        </DashboardGrid>
      </div>
    </main>
  );
}
