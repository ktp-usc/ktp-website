"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import type { applicationStatus } from "@prisma/client";
import { useIncomingApplications } from "@/hooks/useIncomingApplications";

import {
  useSetApplicationFlagMutation,
  useDeleteApplicationMutation,
} from "@/client/hooks/applications";

/* ---------------- Types ---------------- */

type ApplicationStatusUI = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

type ApplicationRow = {
  id: string;
  name: string;
  email: string;
  status: ApplicationStatusUI;
  flagged: boolean;
  createdAt: string | Date | null;
};

function formatCreatedAt(dateLike: string | Date | null): string {
  if (!dateLike) return "—";
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ---------------- Status Helpers ---------------- */

const STATUS_LABELS: Record<ApplicationStatusUI, string> = {
  0: "Closed",
  1: "Bid Rejected",
  2: "Applied",
  3: "Interviews",
  4: "Bid Offered",
  5: "Bid Accepted",
  6: "Incomplete",
  7: "Waitlisted",
};

const UI_TO_PRISMA: Record<ApplicationStatusUI, applicationStatus> = {
  0: "CLOSED",
  1: "BID_DECLINED",
  2: "UNDER_REVIEW",
  3: "INTERVIEW",
  4: "BID_OFFERED",
  5: "BID_ACCEPTED",
  6: "INCOMPLETE",
  7: "WAITLIST",
};

function mapOverrideToUi(override: applicationStatus): ApplicationStatusUI {
  switch (override) {
    case "CLOSED":
      return 0;
    case "BID_DECLINED":
      return 1;
    case "UNDER_REVIEW":
      return 2;
    case "WAITLIST":
      return 7;
    case "INTERVIEW":
      return 3;
    case "BID_OFFERED":
      return 4;
    case "BID_ACCEPTED":
      return 5;
    case "INCOMPLETE":
      return 6;
    default:
      return 6;
  }
}

function deriveUiStatus(app: any): ApplicationStatusUI {
  // ✅ new schema field name is `statusOverride` (lowercase)
  // this assumes your API returns comments sorted newest-first
  //const latestOverride = app.comments?.[0]?.statusOverride ?? null;
  //if (latestOverride) return mapOverrideToUi(latestOverride);
  return mapOverrideToUi(app.status);
}

function StatusPill({ status }: { status: ApplicationStatusUI }) {
  const color =
    status === 5
      ? "bg-green-100 text-green-700 border-green-200"
      : status === 4
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${color}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function ApplicationCardRow({
  app,
  displayStatus,
  dirty,
  onNavigate,
  onDelete,
  onDraftStatusChange,
}: {
  app: ApplicationRow;
  displayStatus: ApplicationStatusUI;
  dirty: boolean;
  onNavigate: (id: string) => void;
  onDelete: (
    id: string,
    appName: string,
    mutation: ReturnType<typeof useDeleteApplicationMutation>,
  ) => void;
  onDraftStatusChange: (id: string, status: ApplicationStatusUI) => void;
}) {
  const setFlag = useSetApplicationFlagMutation(app.id);
  const deleteMutation = useDeleteApplicationMutation(app.id);

  const onToggleFlag = () => {
    setFlag.mutate(!app.flagged);
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onDraftStatusChange(app.id, Number(event.target.value) as ApplicationStatusUI);
  };

  return (
    <Card
      key={app.id}
      onClick={() => onNavigate(app.id)}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg
                       transition-all cursor-pointer overflow-hidden"
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                {app.name}
              </h2>

              <StatusPill status={app.status} />

              {app.flagged ? <Flag className="w-4 h-4 text-red-500" /> : null}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-all transition-colors duration-300">
              {app.email}
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 shrink-0 text-right ml-auto self-center transition-colors duration-300">
            Created {formatCreatedAt(app.createdAt)}
          </p>

          <div
            className="flex items-center gap-2 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Button
              size="sm"
              className="h-8 px-3"
              variant="outline"
              onClick={onToggleFlag}
              disabled={setFlag.isPending}
            >
              {app.flagged ? "Unflag" : "Flag"}
            </Button>

            <select
              value={displayStatus}
              onChange={handleStatusChange}
              aria-label={`Update status for ${app.name}`}
              className={`h-8 px-2 rounded-md border bg-white text-sm
                         dark:bg-gray-900 ${
                           dirty
                             ? "border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400"
                             : "border-gray-200 text-gray-900 dark:border-gray-700 dark:text-white"
                         }`}
            >
              {Object.entries(STATUS_LABELS)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([key, label]) => (
                  <option key={key} value={Number(key)}>
                    {label}
                  </option>
                ))}
            </select>

            <Button
              size="sm"
              className="h-8 px-3"
              variant="destructive"
              onClick={() => onDelete(app.id, app.name, deleteMutation)}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>

            <svg
              className="w-5 h-5 text-gray-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------- Page ---------------- */

export default function ExecApplicationsPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<"lastName" | "status" | "createdAt">(
    "lastName",
  );
  const [currentSemester, setCurrentSemester] = useState(true);
  const [emailStatus, setEmailStatus] = useState<ApplicationStatusUI | "all">(
    "all",
  );
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [draftStatuses, setDraftStatuses] = useState<
    Record<string, ApplicationStatusUI>
  >({});

  const {
    applications: apps,
    total,
    loading: applicationsLoading,
    updateStatuses,
    updating,
  } = useIncomingApplications({
    currentSemester,
    search,
    flagged: showFlaggedOnly ? true : "all",
    status: emailStatus === "all" ? "all" : UI_TO_PRISMA[emailStatus],
    sortBy:
      sortMode === "status"
        ? "status"
        : sortMode === "createdAt"
          ? "createdAt"
          : "name",
    sortOrder: sortMode === "lastName" ? "asc" : "desc",
  });

  const applications = useMemo<ApplicationRow[]>(() => {
    return (apps ?? []).map((a) => ({
      id: a.id,
      name: a.fullName,
      email: a.email,
      status: deriveUiStatus(a),
      flagged: Boolean(a.isFlagged),
      createdAt: a.createdAt,
    }));
  }, [apps]);

  const emailList = useMemo(() => {
    return applications.map((a) => a.email).join("; ");
  }, [applications]);

  const pendingCount = Object.keys(draftStatuses).length;

  const handleDraftStatusChange = (
    id: string,
    nextStatus: ApplicationStatusUI,
  ) => {
    const original = applications.find((app) => app.id === id)?.status;
    setDraftStatuses((prev) => {
      const next = { ...prev };
      if (original === nextStatus) delete next[id];
      else next[id] = nextStatus;
      return next;
    });
  };

  const saveApplicationStatuses = async () => {
    const updates = Object.entries(draftStatuses).map(([id, status]) => ({
      id,
      status: UI_TO_PRISMA[status],
    }));
    if (updates.length === 0) return;

    try {
      await updateStatuses(updates);
      setDraftStatuses({});
    } catch {
      alert("Failed to update status");
    }
  };

  const deleteApplication = (
    id: string,
    appName: string,
    mutation: ReturnType<typeof useDeleteApplicationMutation>,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the application for ${appName}? This cannot be undone.`,
    );
    if (!confirmed) return;

    mutation.mutate();
  };

  const copyEmails = async () => {
    if (!emailList) {
      alert("No emails to copy");
      return;
    }
    await navigator.clipboard.writeText(emailList);
    alert("Emails copied to clipboard");
  };

  if (applicationsLoading) {
    return <div>Loading...</div>;
  }
  return (
    <main className="max-w-7xl mx-auto px-6 py-8 bg-transparent transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
          Exec - Rush Applications
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
          Review and manage all rush applications.
        </p>
      </div>

      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-72 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                           dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:border-gray-700
                           dark:focus:ring-blue-500/20 dark:focus:border-blue-400 transition-colors"
              />

              <div className="text-sm text-gray-500 dark:text-gray-400 sm:ml-auto transition-colors duration-300">
                Showing{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {applicationsLoading ? "…" : applications.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {applicationsLoading ? "…" : total}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:w-14 shrink-0">
                  Sort
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                  <Button
                    variant={sortMode === "lastName" ? "default" : "outline"}
                    onClick={() => setSortMode("lastName")}
                  >
                    Last Name (A → Z)
                  </Button>
                  <Button
                    variant={sortMode === "status" ? "default" : "outline"}
                    onClick={() => setSortMode("status")}
                  >
                    Status (High → Low)
                  </Button>
                  <Button
                    variant={sortMode === "createdAt" ? "default" : "outline"}
                    onClick={() => setSortMode("createdAt")}
                  >
                    Date Created (Newest)
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:w-14 shrink-0">
                  Filter
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                  <Button
                    variant={currentSemester ? "default" : "outline"}
                    onClick={() => setCurrentSemester((v) => !v)}
                  >
                    {currentSemester ? "Current semester" : "All semesters"}
                  </Button>
                  <Button
                    variant={showFlaggedOnly ? "default" : "outline"}
                    onClick={() => setShowFlaggedOnly((v) => !v)}
                  >
                    {showFlaggedOnly
                      ? "Showing Flagged Only"
                      : "Flagged Only"}
                  </Button>
                  <select
                    value={emailStatus}
                    onChange={(e) =>
                      setEmailStatus(
                        e.target.value === "all"
                          ? "all"
                          : (Number(e.target.value) as ApplicationStatusUI),
                      )
                    }
                    aria-label="Filter by status"
                    className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900
                               focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                               dark:bg-gray-900 dark:text-white dark:border-gray-700
                               dark:focus:ring-blue-500/20 dark:focus:border-blue-400 transition-colors"
                  >
                    <option value="all">All statuses</option>
                    {Object.entries(STATUS_LABELS)
                      .sort(([a], [b]) => Number(b) - Number(a))
                      .map(([key, label]) => (
                        <option key={key} value={Number(key)}>
                          {label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:w-14 shrink-0">
                  Action
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                  <Button onClick={copyEmails} variant="outline">
                    Copy Emails
                  </Button>
                  <Button
                    onClick={saveApplicationStatuses}
                    disabled={pendingCount === 0 || updating}
                    className="bg-green-800 text-white hover:bg-green-900 disabled:bg-green-800/50"
                  >
                    {updating
                      ? "Saving…"
                      : pendingCount > 0
                        ? `Save application status (${pendingCount})`
                        : "Save application status"}
                  </Button>
                </div>
              </div>
            </div>

            {/* {isError ? (
              <div className="text-sm text-red-600 dark:text-red-400">
                Failed to load applications.
              </div>
            ) : null} */}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-4">
        {applications.map((app) => {
          const displayStatus = draftStatuses[app.id] ?? app.status;
          return (
            <ApplicationCardRow
              key={app.id}
              app={app}
              displayStatus={displayStatus}
              dirty={draftStatuses[app.id] !== undefined}
              onNavigate={(id) => router.push(`/exec/applications/${id}`)}
              onDelete={deleteApplication}
              onDraftStatusChange={handleDraftStatusChange}
            />
          );
        })}

        {!applicationsLoading && applications.length === 0 ? (
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                No applications found.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
