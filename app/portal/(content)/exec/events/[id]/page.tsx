"use client";
import { useEvent } from "@/hooks/useEvent";
import { useParams } from "next/navigation";
import { useAccounts } from "@/hooks/useAccounts";
import { Calendar, MapPin, Clock, Pencil, Trash2 } from "lucide-react";
import { AccountCard } from "./components/AccountCard";
import { useAttendance } from "@/hooks/useAttendance";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventFormModal } from "../components/eventFormModal";
import { DeleteEventModal } from "../components/deleteEventModal";
import { attendanceAccountTypes, eventAudienceLabel } from "@/lib/events";

export default function page() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { event, loading, updateEvent, deleteEvent } = useEvent(id);
  const {
    accounts,
    loading: accountsLoading,
    search,
    setSearch,
  } = useAccounts({
    types: event ? attendanceAccountTypes(event) : undefined,
    enabled: Boolean(event) && !loading,
  });
  const { attendance, addAttendance, removeAttendance } = useAttendance(id);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  console.log(attendance);
  if (event === undefined || loading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <div className="grid grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm m-16 ">
          <div className="flex gap-6 justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {event.PointRequirement}
              </p>

              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                {event.name}
              </h1>
            </div>

            <div className="flex h-fit items-center gap-3">
              <span
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  event.pledgesOnly
                    ? "bg-amber-100 text-amber-800"
                    : event.activesOnly
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                }`}
              >
                {eventAudienceLabel(event)}
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="cursor-pointer rounded-lg border border-green-200 p-2 text-emerald-900 transition hover:bg-green-100"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsDeleting(true)}
                className="cursor-pointer rounded-lg border border-red-700 p-2 text-red-700 transition hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="mt-6 flex gap-4 ">
            <div className="flex items-center gap-3 rounded-xl ">
              <div className="rounded-lg bg-slate-100 p-2">
                <MapPin size={18} />
              </div>

              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="font-medium">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl  ">
              <div className="rounded-lg bg-slate-100 p-2">
                <Calendar size={18} />
              </div>

              <div>
                <p className="text-xs text-slate-500">Date</p>
                <p className="font-medium">
                  {new Date(event.startDate).toLocaleDateString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl">
              <div className="rounded-lg bg-slate-100 p-2">
                <Clock size={18} />
              </div>

              <div>
                <p className="text-xs text-slate-500">Time</p>
                <p className="font-medium">
                  {new Date(event.startDate).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm mt-16 mb-16 mr-16 ">
          <h1 className="justify-self-center text-lg">ATTENDANCE CODE</h1>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm m-6">
            <p className="justify-self-center text-4xl font-bold tracking-widest">
              {event.attendanceCode}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm ml-16 mr-16 mb-16">
        <div>
          <h1 className="font-semibold text-lg">Member Attendance</h1>
          <p>
            Mark members present or absent, or let them check in with the code.
          </p>
        </div>
        <input
          type="search"
          placeholder="Search accounts..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          className="w-full rounded-lg border mt-8 mb-8 border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm flex flex-col">
          <div className="grid grid-cols-[1fr_2fr_1fr_2fr] p-2">
            <p className="font-semibold text-slate-800 text-xl">Name</p>
            <p className="font-semibold text-slate-800 text-xl">Email</p>
            <p className="font-semibold text-slate-800 text-xl">Status</p>
            <p className="font-semibold text-slate-800 text-xl">Actions</p>
          </div>
          {!accountsLoading &&
            accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                attended={attendance.some(
                  (record) => record.accountId === account.id,
                )}
                updateEvent={() => {}}
                addAttendance={() => {
                  addAttendance(account.id);
                }}
                removeAttendance={() => {
                  removeAttendance(account.id);
                }}
                currentEvent={event}
              />
            ))}
        </div>
      </div>

      {isEditing && (
        <EventFormModal
          event={event}
          onClose={() => setIsEditing(false)}
          onSubmit={updateEvent}
        />
      )}

      {isDeleting && (
        <DeleteEventModal
          eventName={event.name}
          onClose={() => setIsDeleting(false)}
          onConfirm={async () => {
            const deleted = await deleteEvent();
            if (deleted) {
              router.push("/portal/exec/events");
            }
            setIsDeleting(false);
          }}
        />
      )}
    </div>
  );
}
