import { useState, useEffect } from "react";
import { event } from "@prisma/client";
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
  useEffect(() => {
    getEvent();
  }, []);
  async function updateEventAttendance(attendance: string[]) {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendance: attendance }),
      });
      if (!res.ok) {
        return console.error(res);
      }
      const data = await res.json();
      setEvent(data);
    } catch (error) {
      console.error(error);
    } finally {
    }
  }
  return { loading, event, updateEventAttendance };
}
