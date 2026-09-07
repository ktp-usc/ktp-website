"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronRight, Minus, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useAdjustMemberPointsMutation,
  useMemberProgressQuery,
  type MemberProgressItem,
} from "@/client/hooks/memberProgress";
import { nextSemesters } from "@/data/requirementOptions";
import {
  isFullyComplete,
  type MemberProgressUiType,
} from "@/lib/points/progress";
import { cn } from "@/lib/utils";

type ProgressFilter = "All" | MemberProgressUiType;

const TYPE_TABS: ProgressFilter[] = ["All", "Pledge", "Active", "Applicant"];
const SEMESTER = nextSemesters[0];

function fullName(item: MemberProgressItem): string {
  return [item.firstName, item.lastName].filter(Boolean).join(" ").trim() || "—";
}

function initials(item: MemberProgressItem): string {
  const letters = `${item.firstName?.[0] ?? ""}${item.lastName?.[0] ?? ""}`.trim();
  return letters.toUpperCase() || "?";
}

export default function MemberProgressPage() {
  const { data, isLoading, isError } = useMemberProgressQuery(SEMESTER);
  const items = data?.items ?? [];

  const [activeType, setActiveType] = useState<ProgressFilter>("Pledge");
  const [query, setQuery] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const typeCounts = useMemo(() => {
    return {
      All: items.length,
      Pledge: items.filter((item) => item.uiType === "Pledge").length,
      Active: items.filter((item) => item.uiType === "Active").length,
      Applicant: items.filter((item) => item.uiType === "Applicant").length,
    };
  }, [items]);

  const visibleItems = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return items
      .filter((item) => (activeType === "All" ? true : item.uiType === activeType))
      .filter((item) => {
        if (!needle) return true;
        return fullName(item).toLowerCase().includes(needle);
      })
      .filter((item) => {
        if (!hideCompleted) return true;
        return !isFullyComplete(item.categoriesCompleted, item.totalCategories);
      })
      .sort((a, b) => {
        if (a.totalPoints !== b.totalPoints) {
          return a.totalPoints - b.totalPoints;
        }
        const last = a.lastName.localeCompare(b.lastName);
        if (last !== 0) return last;
        return a.firstName.localeCompare(b.firstName);
      });
  }, [items, activeType, query, hideCompleted]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const listTitle =
    activeType === "All" ? "All Members" : `${activeType}s`;

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 bg-transparent transition-colors duration-300">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900 dark:text-white transition-colors duration-300">
          Member Progress
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 transition-colors duration-300">
          View {SEMESTER} points and requirement completion for pledges, actives, and applicants.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-wrap">
          {TYPE_TABS.map((filter) => (
            <Button
              key={filter}
              size="sm"
              variant={activeType === filter ? "default" : "outline"}
              onClick={() => setActiveType(filter)}
              className={`cursor-pointer transition-colors sm:h-9 sm:px-4 sm:text-sm ${
                activeType === filter
                  ? ""
                  : "text-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
              }`}
            >
              {filter}
              <span className="ml-1.5 text-xs sm:text-sm font-semibold">({typeCounts[filter]})</span>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="hide-completed"
            checked={hideCompleted}
            onCheckedChange={setHideCompleted}
          />
          <Label htmlFor="hide-completed" className="text-gray-700 dark:text-gray-300 cursor-pointer">
            Hide completed
          </Label>
        </div>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="gap-4 p-4 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>
            {listTitle} ({visibleItems.length})
          </CardTitle>
          <div className="relative w-full min-w-0 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
              Loading progress…
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500 dark:text-red-400 transition-colors duration-300">
              Failed to load member progress.
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
              No members found in this category.
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {visibleItems.map((item) => {
                  const expanded = expandedIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
                    >
                      <button
                        type="button"
                        className="flex w-full min-w-0 items-start gap-2 text-left"
                        onClick={() => toggleExpanded(item.id)}
                      >
                        <span className="mt-1.5 text-gray-500 dark:text-gray-400">
                          {expanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </span>
                        <Headshot item={item} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                            {fullName(item)}
                          </p>
                        </div>
                      </button>
                      <div className="mt-1 flex items-center gap-3 pl-6">
                        {item.uiType === "Pledge" ? (
                          <PointsAdjuster item={item} />
                        ) : (
                          <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
                            {item.totalPoints} pts
                          </span>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.uiType}
                        </p>
                      </div>
                      <div className="mt-2 pl-6">
                        <TickedProgress
                          completed={item.categoriesCompleted}
                          total={item.totalCategories}
                          label={`${item.categoriesCompleted} of ${item.totalCategories} categories`}
                        />
                      </div>
                      {expanded ? (
                        <RequirementDetails item={item} className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-800" />
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead>Member</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="min-w-[220px]">Categories</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleItems.map((item) => {
                      const expanded = expandedIds.has(item.id);
                      return (
                        <React.Fragment key={item.id}>
                          <TableRow
                            className="cursor-pointer"
                            onClick={() => toggleExpanded(item.id)}
                          >
                            <TableCell className="w-10 text-gray-500 dark:text-gray-400">
                              {expanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex min-w-0 items-center gap-3">
                                <Headshot item={item} />
                                <span className="truncate font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                                  {fullName(item)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell
                              onClick={(event) => event.stopPropagation()}
                            >
                              {item.uiType === "Pledge" ? (
                                <PointsAdjuster item={item} />
                              ) : (
                                <span className="text-sm tabular-nums text-gray-700 dark:text-gray-300">
                                  {item.totalPoints}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                              {item.uiType}
                            </TableCell>
                            <TableCell>
                              <TickedProgress
                                completed={item.categoriesCompleted}
                                total={item.totalCategories}
                                label={`${item.categoriesCompleted} of ${item.totalCategories} categories`}
                              />
                            </TableCell>
                          </TableRow>
                          {expanded ? (
                            <TableRow className="hover:bg-transparent">
                              <TableCell colSpan={5} className="bg-gray-50 dark:bg-gray-900/60">
                                <RequirementDetails item={item} className="px-4 py-4" />
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RequirementDetails({
  item,
  className,
}: {
  item: MemberProgressItem;
  className?: string;
}) {
  if (item.pointRequirementProgress.length === 0) {
    return (
      <p className={cn("text-sm text-gray-500 dark:text-gray-400", className)}>
        No {SEMESTER} requirements for this member type.
      </p>
    );
  }

  return (
    <ul className={cn("space-y-3", className)}>
      {item.pointRequirementProgress.map((progress) => (
        <li
          key={progress.requirement.id}
          className="grid min-w-0 grid-cols-1 gap-2 text-sm text-gray-700 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-center lg:gap-4 dark:text-gray-300"
        >
          <span className="break-words font-medium">{progress.requirement.name}</span>
          <TickedProgress
            completed={progress.completed}
            total={progress.requirement.requiredAmount}
            label={`${progress.completed} of ${progress.requirement.requiredAmount} for ${progress.requirement.name}`}
          />
        </li>
      ))}
    </ul>
  );
}

function PointsAdjuster({ item }: { item: MemberProgressItem }) {
  const adjustPoints = useAdjustMemberPointsMutation(SEMESTER);

  function change(delta: 1 | -1) {
    if (delta < 0 && item.totalPoints <= 0) return;
    adjustPoints.mutate(
      { accountId: item.id, delta },
      {
        onError: () => {
          toast.error("Could not update points. Please try again.");
        },
      },
    );
  }

  return (
    <div
      className="flex shrink-0 items-center gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-7 w-7 cursor-pointer"
        disabled={item.totalPoints <= 0}
        aria-label={`Decrease points for ${fullName(item)}`}
        onClick={() => change(-1)}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="min-w-8 text-center text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
        {item.totalPoints}
      </span>
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-7 w-7 cursor-pointer"
        aria-label={`Increase points for ${fullName(item)}`}
        onClick={() => change(1)}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function TickedProgress({
  completed,
  total,
  label,
  className,
}: {
  completed: number;
  total: number;
  label: string;
  className?: string;
}) {
  const cappedTotal = Math.max(0, total);
  const fillPercent =
    cappedTotal <= 0 ? 0 : Math.min(100, (Math.max(0, completed) / cappedTotal) * 100);
  const ticks =
    cappedTotal > 1
      ? Array.from({ length: cappedTotal - 1 }, (_, index) => ((index + 1) / cappedTotal) * 100)
      : [];

  return (
    <div className={cn("flex min-w-0 items-center gap-2 sm:gap-3", className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={cappedTotal}
        aria-valuenow={Math.min(Math.max(0, completed), cappedTotal)}
        className="relative h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-200 shadow-inner dark:bg-gray-700"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-[width] duration-300 dark:from-teal-400 dark:to-teal-300"
          style={{ width: `${fillPercent}%` }}
        />
        {ticks.map((position) => (
          <div
            key={position}
            aria-hidden
            className="absolute top-0.5 bottom-0.5 w-px bg-white/80 dark:bg-gray-950/70"
            style={{ left: `${position}%` }}
          />
        ))}
      </div>
      <span className="shrink-0 text-right text-xs tabular-nums text-gray-700 sm:w-12 sm:text-sm dark:text-gray-300">
        {completed} / {total}
      </span>
    </div>
  );
}

function Headshot({
  item,
  size = "md",
}: {
  item: MemberProgressItem;
  size?: "sm" | "md";
}) {
  const [failed, setFailed] = useState(false);
  const dimension = size === "sm" ? 32 : 40;

  if (!item.headshotBlobURL || failed) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-200",
          size === "sm" ? "h-8 w-8" : "h-10 w-10",
        )}
      >
        {initials(item)}
      </div>
    );
  }

  return (
    <Image
      src={item.headshotBlobURL}
      alt={fullName(item)}
      width={dimension}
      height={dimension}
      className={cn(
        "shrink-0 rounded-full object-cover",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
      )}
      onError={() => setFailed(true)}
    />
  );
}
