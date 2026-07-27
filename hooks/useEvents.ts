"use-client";

import { useEffect, useState } from "react";
type eventInput = {
  PointRequirement: String;
  name: String;
  attendance: String[];
  description: String;
  startDate: String;
  location: String;
  activesOnly: Boolean;
};
export function UseEvents() {
  const [events, setEvents] = useState<eventInput[]>([]);

  async function createEvent(event: eventInput) {
    console.log("event", event);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      if (!res.ok) {
        return console.error(res);
      }
      const newEvent = await res.json();
      setEvents((prev) => [...prev, newEvent]);
    } catch (error) {
      console.error(error);
    }
  }

  return { createEvent, events };
}
