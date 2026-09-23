"use client";

import { NewEventModal } from "./components/newEventModal";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { UseEvents } from "@/hooks/useEvents";
import { Event } from "./components/eventCard";
import { useNumAccounts } from "@/hooks/useAccounts";
import { attendanceAccountTypes } from "@/lib/events";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ALL_REQUIREMENTS = "all";

function requirementName(name: string) {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : "Unassigned";
}

export default function ExecEvents() {
  const [newEvent, setNewEvent] = useState(false);
  const [requirementTab, setRequirementTab] = useState(ALL_REQUIREMENTS);
  const { events, createEvent, updateEvent, deleteEvent, loading } = UseEvents();
  const { numAccounts: activeCount, loading: activeCountLoading } =
    useNumAccounts(
      attendanceAccountTypes({ activesOnly: true, pledgesOnly: false }),
    );
  const { numAccounts: pledgeCount, loading: pledgeCountLoading } =
    useNumAccounts(
      attendanceAccountTypes({ activesOnly: false, pledgesOnly: true }),
    );
  const { numAccounts: chapterCount, loading: chapterCountLoading } =
    useNumAccounts(
      attendanceAccountTypes({ activesOnly: false, pledgesOnly: false }),
    );

  const requirementTabs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const event of events) {
      const name = requirementName(event.PointRequirement);
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [events]);

  useEffect(() => {
    if (
      requirementTab !== ALL_REQUIREMENTS &&
      !requirementTabs.some(([name]) => name === requirementTab)
    ) {
      setRequirementTab(ALL_REQUIREMENTS);
    }
  }, [requirementTab, requirementTabs]);

  const visibleEvents =
    requirementTab === ALL_REQUIREMENTS
      ? events
      : events.filter(
          (event) => requirementName(event.PointRequirement) === requirementTab,
        );

  if (
    loading ||
    activeCountLoading ||
    pledgeCountLoading ||
    chapterCountLoading
  ) {
    return <div>Loading...</div>;
  }

  return (
    <div className="m-16">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Attendance</h1>
        <p className="mt-2 text-gray-600">
          Create attendance events, share codes, and track member turnout.
        </p>

        <button
          onClick={() => setNewEvent(true)}
          className="mt-6 flex items-center gap-3 rounded-2xl bg-blue-800 px-5 py-3 text-white transition hover:bg-blue-900 cursor-pointer"
        >
          <Plus size={20} />
          <span>Create New Event</span>
        </button>
      </div>

      <Tabs
        value={requirementTab}
        onValueChange={setRequirementTab}
        className="mb-6 w-full"
      >
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-slate-100 p-1">
          <TabsTrigger
            value={ALL_REQUIREMENTS}
            className="data-[state=active]:bg-blue-800 data-[state=active]:text-white"
          >
            All ({events.length})
          </TabsTrigger>
          {requirementTabs.map(([name, count]) => (
            <TabsTrigger
              key={name}
              value={name}
              className="data-[state=active]:bg-blue-800 data-[state=active]:text-white"
            >
              {name} ({count})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visibleEvents.length === 0 ? (
        <p className="text-gray-600">No events for this requirement yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {visibleEvents.map((event) => (
            <Event
              key={event.id}
              event={event}
              totalAccounts={
                event.pledgesOnly
                  ? pledgeCount
                  : event.activesOnly
                    ? activeCount
                    : chapterCount
              }
              onUpdate={updateEvent}
              onDelete={deleteEvent}
            />
          ))}
        </div>
      )}

      {newEvent && (
        <NewEventModal
          onClose={() => setNewEvent(false)}
          createEvent={createEvent}
        />
      )}
    </div>
  );
}
