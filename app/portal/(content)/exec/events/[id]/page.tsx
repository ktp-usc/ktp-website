"use client";
import { event } from "@prisma/client";
import { useEvent } from "@/hooks/useEvent";
import { useParams } from "next/navigation";
import { useAccounts } from "@/hooks/useAccounts";
import { Calendar, MapPin, Clock } from "lucide-react";
import { AccountCard } from "./components/AccountCard";
type eventDetailsProp = {
  event: event;
};
export default function page() {
  const { id } = useParams<{ id: string }>();
  const { event, loading } = useEvent(id);
  const { accounts, loading: accountsLoading } = useAccounts();
  if (loading || event === undefined || accountsLoading) {
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

            <span
              className={`h-fit rounded-full px-4 py-2 text-sm font-medium ${
                event.activesOnly
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {event.activesOnly ? "Actives Only" : "All Members"}
            </span>
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
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm ">
          <div className="grid grid-cols-[1fr_2fr_1fr_1fr_2fr]">
            <p className="font-semibold text-slate-800">Name</p>
            <p className="font-semibold text-slate-800">Email</p>
            <p className="font-semibold text-slate-800">Status</p>
            <p className="font-semibold text-slate-800">Actions</p>
          </div>
          {accounts.map((account) => (
            <AccountCard account={account} />
          ))}
        </div>
      </div>
    </div>
  );
}
