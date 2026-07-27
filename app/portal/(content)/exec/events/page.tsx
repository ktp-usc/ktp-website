"use client";
import { NewEventModal } from "./components/newEventModal";
import { Plus } from "lucide-react";
import { useState } from "react";
import { UseEvents } from "@/hooks/useEvents";

export default function execEvents() {
  const [newEvent, setNewEvent] = useState(false);
  const { events, createEvent } = UseEvents();
  return (
    <div className="m-16">
      <div className="flex justify-around">
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
      {newEvent && (
        <NewEventModal
          onClose={() => setNewEvent(false)}
          createEvent={createEvent}
        />
      )}
    </div>
  );
}
