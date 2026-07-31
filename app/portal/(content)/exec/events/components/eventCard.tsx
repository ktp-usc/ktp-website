import { event } from "@prisma/client";
import Link from "next/link";
import { useAttendance } from "@/hooks/useAttendance";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

type EventProps = {
  event: event;
  totalAccounts: number;
};

export function Event({ event, totalAccounts }: EventProps) {
  const { attendance } = useAttendance(event.id);

  const attendancePercentage =
    totalAccounts > 0 ? (attendance.length / totalAccounts) * 100 : 0;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200  hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {event.PointRequirement}
          </p>

          <h2 className="text-xl font-semibold text-slate-900">{event.name}</h2>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            event.activesOnly
              ? "bg-emerald-100 text-emerald-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {event.activesOnly ? "Actives Only" : "All Members"}
        </span>
      </div>

      {/* Metadata */}
      <div className="mt-6 grid grid-cols-3 w-full text-sm">
        <div className=" flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2">
            <MapPin size={18} />
          </div>

          <div>
            <p className="text-xs text-slate-500">Location</p>
            <p className="font-medium">{event.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2">
            <Calendar size={18} />
          </div>

          <div>
            <p className="text-xs text-slate-500">Date</p>
            <p className="font-medium">
              {new Date(event.startDate).toLocaleDateString([], {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Attendance */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} />
            <span className="text-sm font-medium">Attendance</span>
          </div>

          <span className="text-sm font-semibold text-slate-700">
            {attendance.length}/{totalAccounts}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${attendancePercentage}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto_auto] gap-2 pt-6">
        <Link href={`/portal/exec/events/${event.id}`} className="w-full">
          <button className="flex items-center cursor-pointer justify-center w-full gap-2 rounded-lg bg-blue-800 text-white px-4 py-2 text-sm font-medium transition hover:bg-slate-100">
            <Eye size={16} />
            Details
          </button>
        </Link>

        <button className="rounded-lg border border-green-200 text-emerald-900 p-2 transition hover:bg-green-100 cursor-pointer">
          <Pencil size={16} />
        </button>

        <button className="rounded-lg border border-red-700 p-2 cursor-pointer text-red-700 transition hover:bg-red-50">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
