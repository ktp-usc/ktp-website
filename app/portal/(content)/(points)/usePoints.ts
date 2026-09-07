import { attendance, PointRequirement, event } from "@prisma/client";
import { useState, useEffect } from "react";
import { getActivePointRequirements } from "@/lib/points/progress";
import { RequirementProgressData } from "@/types";

export function usePoints(isActive: boolean) {
  const [requirementProgressData, setRequirementProgressData] =
    useState<RequirementProgressData>({
      categoriesCompleted: 0,
      totalPoints: 0,
      totalCategories: 0,
      pointRequirementProgress: [],
    });
  const [loading, setLoading] = useState(true);
  const [accountId, setAccountId] = useState("");
  const [attendance, setAttendance] = useState<attendance[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [events, setEvents] = useState<event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [pointRequirements, setPointRequirements] = useState<
    PointRequirement[]
  >([]);
  const [requirementsLoading, setRequirementsLoading] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);

  async function getAttendance() {
    try {
      setAttendanceLoading(true);
      const res = await fetch(`/api/accounts/${accountId}/attendance`);
      if (!res.ok) {
        throw new Error("error");
      }
      const attendance = await res.json();
      setAttendance(attendance);
    } catch (error) {
      console.error(error);
    } finally {
      setAttendanceLoading(false);
    }
  }
  async function getEvents() {
    try {
      setEventsLoading(true);
      const res = await fetch(`/api/events`);
      if (!res.ok) {
        throw new Error("error");
      }
      const events = await res.json();
      setEvents(events);
    } catch (error) {
      console.error(error);
    } finally {
      setEventsLoading(false);
    }
  }
  async function getAccountPoints() {
    try {
      const res = await fetch("/api/accounts/me");
      if (!res.ok) return;
      const json = await res.json();
      const account = json.data ?? json;
      setPointsAwarded(account?.pointsAwarded ?? 0);
    } catch (error) {
      console.error(error);
    }
  }

  async function getPointRequirements() {
    try {
      setRequirementsLoading(true);
      const res = await fetch(
        `/api/requirements?memberType=${isActive ? "ACTIVE" : "PLEDGE"}`,
      );
      if (!res.ok) {
        return console.error(res);
      }
      const data = await res.json();
      setPointRequirements(data);
    } catch (error) {
      console.error(error);
    } finally {
      setRequirementsLoading(false);
    }
  }

  async function updateAttendance(attendanceCode: string) {
    try {
      const res = await fetch(`/api/accounts/${accountId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceCode }),
      });
      if (!res.ok) {
        return console.error(res);
      }
      const attendance = await res.json();
      setAttendance((prev) => [...prev, attendance]);
      setPointsAwarded(
        (prev) => prev + (attendance?.pointsAwarded ?? 0),
      );
    } catch (error) {
      return console.error(error);
    } finally {
    }
  }

  useEffect(() => {
    setLoading(true);
    if (accountId) {
      getPointRequirements();
      getEvents();
      getAttendance();
      getAccountPoints();
    }
  }, [accountId]);

  useEffect(() => {
    if (!attendanceLoading && !eventsLoading && !requirementsLoading) {
      const progress = getActivePointRequirements(
        attendance,
        pointRequirements,
        events,
      );
      setRequirementProgressData({
        ...progress,
        totalPoints: pointsAwarded,
      });
    }
  }, [attendanceLoading, attendance, eventsLoading, requirementsLoading, pointsAwarded]);
  useEffect(() => {
    setLoading(false);
  }, [requirementProgressData]);
  return {
    requirementProgressData,
    loading,
    setAccountId,
    updateAttendance,
    attendance,
    events,
  };
}

// const {
//   activePointRequirements: CATEGORIES,
//   loading: activePointRequirementsLoading,
// } = useActivePointRequirements();

// get pointRequirements
// get events
// get attendance
