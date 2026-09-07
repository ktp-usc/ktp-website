"use client";

import { NewEventModal } from "./components/newEventModal";
import { Plus } from "lucide-react";
import { useState } from "react";
import { UseEvents } from "@/hooks/useEvents";
import { Event } from "./components/eventCard";
import { useNumAccounts } from "@/hooks/useAccounts";
import { attendanceAccountTypes } from "@/lib/events";

export default function ExecEvents() {
  const [newEvent, setNewEvent] = useState(false);
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

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
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

      {newEvent && (
        <NewEventModal
          onClose={() => setNewEvent(false)}
          createEvent={createEvent}
        />
      )}
    </div>
  );
}
