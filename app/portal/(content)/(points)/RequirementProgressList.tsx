"use client";

import { useMemo, useState } from "react";
import type { attendance, event } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RequirementProgressData } from "@/types";

type ProgressItem = RequirementProgressData["pointRequirementProgress"][number];

type RequirementAttendance = {
  attendance: attendance;
  event: event;
};

function attendanceForRequirement(
  requirementName: string,
  events: event[],
  attendances: attendance[],
): RequirementAttendance[] {
  const eventsById = new Map(events.map((item) => [item.id, item]));
  const matchingEventIds = new Set(
    events
      .filter((item) => item.PointRequirement === requirementName)
      .map((item) => item.id),
  );

  return attendances
    .filter((record) => matchingEventIds.has(record.eventId))
    .map((record) => ({
      attendance: record,
      event: eventsById.get(record.eventId)!,
    }))
    .filter((item) => item.event)
    .sort((a, b) => {
      const aDate = new Date(
        a.attendance.checkedInAt ?? a.event.startDate,
      ).getTime();
      const bDate = new Date(
        b.attendance.checkedInAt ?? b.event.startDate,
      ).getTime();
      return bDate - aDate;
    });
}

function formatEventDate(value: string | Date) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatEventTime(value: string | Date) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RequirementProgressList({
  items,
  events,
  attendance,
}: {
  items: ProgressItem[];
  events: event[];
  attendance: attendance[];
}) {
  const [selected, setSelected] = useState<ProgressItem | null>(null);

  const selectedAttendance = useMemo(() => {
    if (!selected) return [];
    return attendanceForRequirement(
      selected.requirement.name,
      events,
      attendance,
    );
  }, [selected, events, attendance]);

  return (
    <>
      <div className="space-y-5 lg:overflow-y-auto lg:pr-2 lg:pb-4 lg:max-h-[calc(100vh-14rem)]">
        {items.map((requirement) => {
          const pct = Math.min(
            Math.round(
              (requirement.completed /
                (requirement.requirement.requiredAmount > 0
                  ? requirement.requirement.requiredAmount
                  : 1)) *
                100,
            ),
            100,
          );
          const isComplete =
            requirement.completed >= requirement.requirement.requiredAmount;

          return (
            <Card
              key={requirement.requirement.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(requirement)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelected(requirement);
                }
              }}
              className={`cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2d5a] dark:focus-visible:ring-indigo-400 ${
                isComplete
                  ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                  : "border-l-4 border-l-[#1e2d5a] dark:border-l-indigo-400"
              }`}
            >
              <CardContent className="px-7 py-6 pt-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <p
                    className={`text-base leading-snug ${
                      isComplete
                        ? "font-semibold text-green-900 dark:text-green-300"
                        : "font-bold text-gray-900 dark:text-white"
                    }`}
                  >
                    {requirement.requirement.name}
                  </p>

                  {isComplete ? (
                    <Badge className="shrink-0 rounded-full gap-1.5 px-3 py-1.5 text-sm bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-transparent hover:bg-green-100">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Complete
                    </Badge>
                  ) : (
                    <Badge className="shrink-0 rounded-full gap-1.5 px-3 py-1.5 text-sm bg-[rgba(30,45,90,0.08)] text-[#1e2d5a] dark:bg-indigo-950/50 dark:text-indigo-400 border-transparent hover:bg-[rgba(30,45,90,0.08)]">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      In Progress
                    </Badge>
                  )}
                </div>

                <div>
                  <p
                    className={`text-sm font-semibold tabular-nums text-right mb-2 ${
                      isComplete
                        ? "text-green-700 dark:text-green-400"
                        : "text-[#1e2d5a] dark:text-indigo-400"
                    }`}
                  >
                    {requirement.completed} /{" "}
                    {requirement.requirement.requiredAmount}
                  </p>

                  <div
                    className={`w-full rounded-full h-4 overflow-hidden ${
                      isComplete
                        ? "bg-green-100 dark:bg-green-950"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <div
                      className={`h-4 rounded-full transition-all duration-700 bg-gradient-to-r ${
                        isComplete
                          ? "from-green-700 to-green-500"
                          : "from-[#1e2d5a] to-[#3b5998] dark:from-indigo-600 dark:to-indigo-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 text-right">
                    {pct}% complete · View attendance
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 space-y-1.5 border-b border-slate-200 px-6 py-5 dark:border-gray-800">
            <DialogTitle>{selected?.requirement.name}</DialogTitle>
            <DialogDescription>
              {selected
                ? `${selected.completed} / ${selected.requirement.requiredAmount} completed`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {selected?.requirement.description ? (
              <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
                {selected.requirement.description}
              </p>
            ) : null}

            {selectedAttendance.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No attendance recorded for this requirement yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {selectedAttendance.map(({ attendance: record, event }) => (
                  <li
                    key={`${record.eventId}-${record.accountId}`}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {event.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {formatEventDate(event.startDate)} ·{" "}
                      {formatEventTime(event.startDate)}
                    </p>
                    {event.location ? (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {event.location}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
                      {record.checkedInAt ? (
                        <span>
                          Checked in{" "}
                          {formatEventDate(record.checkedInAt)}{" "}
                          {formatEventTime(record.checkedInAt)}
                        </span>
                      ) : null}
                      {record.pointsAwarded != null ? (
                        <span className="tabular-nums">
                          {record.pointsAwarded}{" "}
                          {record.pointsAwarded === 1 ? "point" : "points"}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
