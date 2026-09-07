import { useState, useEffect } from "react";
import { event } from "@prisma/client";
import type { EventFormData } from "@/lib/events";

export function useEvent(id: string) {
  const [event, setEvent] = useState<event>();
  const [loading, setLoading] = useState(true);

  async function getEvent() {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) {
        console.error(res);
      }
      const data = await res.json();
      setEvent(data);
    } catch (error) {
      return console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function updateEvent(eventData: EventFormData) {
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
      setEvent(updated);
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteEvent() {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        return false;
      }
      setEvent(undefined);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  useEffect(() => {
    getEvent();
  }, []);

  return { loading, event, updateEvent, deleteEvent };
}
