"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { canAccessActiveDashboard, portalHomePath } from "@/lib/auth/roles";
import { DashboardGrid } from "../components/DashboardCard";
import {
  ActivePointsCard,
  CareerCenterCard,
  ChapterCalendarCard,
  RusheesCard,
  VoteCard,
} from "../components/portalCards";
import { usePortalSession } from "../hooks/usePortalSession";

export default function ActivePage() {
  const router = useRouter();
  const { userId, isLoading, type, firstName } = usePortalSession();
  const allowed = canAccessActiveDashboard(type);

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
          Vote on fraternity matters and stay on top of chapter resources.
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
          Active Dashboard
        </h3>
        <DashboardGrid>
          <VoteCard />
          <CareerCenterCard />
          <ActivePointsCard />
          <ChapterCalendarCard />
          <RusheesCard />
        </DashboardGrid>
      </div>
    </main>
  );
}
