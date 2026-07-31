"use-client";

import { useEffect, useState } from "react";
import { event } from "@prisma/client";
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
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<event[]>([]);

  async function createEvent(event: eventInput) {
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

  async function getEvents() {
    setLoading(true);
    try {
      const res = await fetch(`/api/events`);
      if (!res.ok) {
        return console.error(res);
      }
      const events = await res.json();
      setEvents(events);
    } catch (error) {
      return console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getEvents();
  }, []);

  return { createEvent, events, loading };
}
