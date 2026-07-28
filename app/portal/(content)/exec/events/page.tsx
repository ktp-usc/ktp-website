"use client";
import { NewEventModal } from "./components/newEventModal";
import { Plus } from "lucide-react";
import { useState } from "react";
import { UseEvents } from "@/hooks/useEvents";
import { Event } from "./components/eventCard";
import { useNumAccounts } from "@/hooks/useAccounts";
export default function execEvents() {
  const [newEvent, setNewEvent] = useState(false);
  const { events, createEvent, loading } = UseEvents();
  const { numAccounts: totalAccounts, loading: accountsLoading } =
    useNumAccounts();
  const event = events[0];
  if (loading || accountsLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="m-16">
      <div className="flex justify-between m-auto">
        <div>
          <h1>Attendance</h1>
          <p>Create attendance events, share codes and track member turnout</p>
        </div>
        <button
          className="flex items-center gap-4 p-2 pl-4 pr-4 rounded-2xl bg-blue-800 text-white cursor-pointer"
          onClick={() => setNewEvent(true)}
        >
          <Plus />
          <p>Create New Event</p>
        </button>
      </div>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
        {events.map((event) => (
          <Event key={event.id} event={event} totalAccounts={totalAccounts} />
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
