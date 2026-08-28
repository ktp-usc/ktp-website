"use client";

import { useEffect, useState } from "react";
import { event } from "@prisma/client";
import type { EventFormData } from "@/lib/events";

export function UseEvents() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<event[]>([]);

  async function createEvent(eventData: EventFormData) {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
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

  async function updateEvent(id: string, eventData: EventFormData) {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      if (!res.ok) {
        return console.error(res);
      }
      const updated = await res.json();
      setEvents((prev) =>
        prev.map((item) => (item.id === id ? updated : item)),
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteEvent(id: string) {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        return console.error(res);
      }
      setEvents((prev) => prev.filter((item) => item.id !== id));
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

  return { createEvent, updateEvent, deleteEvent, events, loading };
}
