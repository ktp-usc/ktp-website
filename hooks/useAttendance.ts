import { useState, useEffect } from "react";
import { attendance } from "@prisma/client";

export function useAttendance(eventId: string) {
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState<attendance[]>([]);
  async function getAttendance() {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/attendance`);
      if (!res.ok) {
        return console.error(res);
      }
      const data = await res.json();
      setAttendance(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  async function addAttendance(accountId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      if (!res.ok) {
        return console.error(res);
      }
      const data = await res.json();
      setAttendance((prev) => [...prev, data]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  async function removeAttendance(accountId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/attendance`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      if (!res.ok) {
        return console.error(res);
      }
      const data = await res.json();
      setAttendance((prev) =>
        prev.filter((attendance) => attendance.accountId !== accountId),
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAttendance();
  }, []);
  return { attendance, loading, addAttendance, removeAttendance };
}
