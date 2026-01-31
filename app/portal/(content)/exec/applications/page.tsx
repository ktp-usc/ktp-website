'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import type { applicationStatus } from '@prisma/client';

import { useApplicationsQuery, useSetApplicationFlagMutation, useDeleteApplicationMutation } from '@/client/hooks/applications';

/* ---------------- Types ---------------- */

type ApplicationStatusUI = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

type ApplicationRow = {
    id: string;
    name: string;
    email: string;
    status: ApplicationStatusUI;
    flagged: boolean;
};

/* ---------------- Status Helpers ---------------- */

const STATUS_LABELS: Record<ApplicationStatusUI, string> = {
    0: 'Closed',
    1: 'Bid Rejected',
    2: 'Applied',
    3: 'Interviews',
    4: 'Bid Offered',
    5: 'Bid Accepted',
    6: 'Incomplete',
    7: 'Waitlisted',
};

function mapOverrideToUi(override: applicationStatus): ApplicationStatusUI {
    switch (override) {
        case 'CLOSED':
            return 0;
        case 'BID_DECLINED':
            return 1;
        case 'UNDER_REVIEW':
            return 2;
        case 'WAITLIST':
            return 7;
        case 'INTERVIEW':
            return 3;
        case 'BID_OFFERED':
            return 4;
        case 'BID_ACCEPTED':
            return 5;
        case 'INCOMPLETE':
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
            ? 'bg-green-100 text-green-700 border-green-200'
            : status === 4
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-gray-100 text-gray-700 border-gray-200';

    return <span className={`px-3 py-1 rounded-full text-xs font-medium border ${color}`}>{STATUS_LABELS[status]}</span>;
}

function ApplicationCardRow({
    app,
    onNavigate,
    onDelete
}: {
    app: ApplicationRow;
    onNavigate: (id: string) => void;
    onDelete: (id: string, appName: string, mutation: ReturnType<typeof useDeleteApplicationMutation>) => void;
}) {
    const setFlag = useSetApplicationFlagMutation(app.id);
    const deleteMutation = useDeleteApplicationMutation(app.id);

    const onToggleFlag = () => {
        setFlag.mutate(!app.flagged);
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
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white transition-colors duration-300">{app.name}</h2>

                            <StatusPill status={app.status} />

                            {app.flagged ? <Flag className="w-4 h-4 text-red-500" /> : null}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-all transition-colors duration-300">{app.email}</p>
                    </div>

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
                            {app.flagged ? 'Unflag' : 'Flag'}
                        </Button>

                        <Button
                            size="sm"
                            className="h-8 px-3"
                            variant="destructive"
                            onClick={() => onDelete(app.id, app.name, deleteMutation)}
                            disabled={deleteMutation.isPending}
                        >
                            Delete
                        </Button>

                        <svg className="w-5 h-5 text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

    // ✅ new hook returns { items, total }
    const { data, isFetching, isError } = useApplicationsQuery({});
    const apps = data?.items ?? [];

    const [search, setSearch] = useState('');
    const [sortMode, setSortMode] = useState<'lastName' | 'status'>('lastName');
    const [emailStatus, setEmailStatus] = useState<ApplicationStatusUI | 'all'>('all');
    const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

    const applications = useMemo<ApplicationRow[]>(() => {
        return (apps ?? []).map((a: any) => ({
            id: a.id,
            name: a.fullName,
            email: a.email,
            status: deriveUiStatus(a),
            flagged: Boolean(a.isFlagged)
        }));
    }, [apps]);

    const filteredApplications = useMemo(() => {
        let list = applications.filter((app) => app.name.toLowerCase().includes(search.toLowerCase()));

        if (emailStatus !== 'all') {
            list = list.filter((app) => app.status === emailStatus);
        }

        if (showFlaggedOnly) {
            list = list.filter((app) => app.flagged);
        }

        if (sortMode === 'lastName') {
            list = [...list].sort((a, b) => {
                const getLastName = (name: string) => {
                    const parts = name.trim().split(/\s+/);
                    return parts[parts.length - 1].toLowerCase();
                };

                const lastA = getLastName(a.name);
                const lastB = getLastName(b.name);

                return lastA.localeCompare(lastB);
            });
        }

        if (sortMode === 'status') {
            list = [...list].sort((a, b) => b.status - a.status);
        }

        return list;
    }, [applications, search, sortMode, emailStatus, showFlaggedOnly]);

    const emailList = useMemo(() => {
        const list = emailStatus === 'all' ? applications : applications.filter((a) => a.status === emailStatus);
        return list.map((a) => a.email).join('; ');
    }, [applications, emailStatus]);

    const deleteApplication = (
        id: string,
        appName: string,
        mutation: ReturnType<typeof useDeleteApplicationMutation>
    ) => {
        const confirmed = window.confirm(`Are you sure you want to delete the application for ${appName}? This cannot be undone.`);
        if (!confirmed) return;

        mutation.mutate();
    };

    const copyEmails = async () => {
        if (!emailList) {
            alert('No emails to copy');
            return;
        }
        await navigator.clipboard.writeText(emailList);
        alert('Emails copied to clipboard');
    };

    return (
        <main className="max-w-7xl mx-auto px-6 py-8 bg-transparent transition-colors duration-300">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Exec - Rush Applications</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">Review and manage all rush applications.</p>
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

                            <select
                                value={emailStatus}
                                onChange={(e) => setEmailStatus(e.target.value === 'all' ? 'all' : (Number(e.target.value) as ApplicationStatusUI))}
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

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <Button
                                variant={sortMode === 'lastName' ? 'default' : 'outline'}
                                onClick={() => setSortMode('lastName')}
                            >
                                Sort by Last Name (A → Z)
                            </Button>

                            <Button
                                variant={sortMode === 'status' ? 'default' : 'outline'}
                                onClick={() => setSortMode('status')}
                            >
                                Sort by Status (High → Low)
                            </Button>

                            <Button
                                variant={showFlaggedOnly ? 'default' : 'outline'}
                                onClick={() => setShowFlaggedOnly((v) => !v)}
                            >
                                {showFlaggedOnly ? 'Showing Flagged Only' : 'Filter: Flagged Only'}
                            </Button>

                            <Button onClick={copyEmails} variant="outline">
                                Copy Emails
                            </Button>

                            <div className="text-sm text-gray-500 dark:text-gray-400 sm:ml-auto transition-colors duration-300">
                                Showing{' '}
                                <span className="font-medium text-gray-900 dark:text-white">{isFetching ? '…' : filteredApplications.length}</span> of{' '}
                                <span className="font-medium text-gray-900 dark:text-white">{isFetching ? '…' : applications.length}</span>
                            </div>
                        </div>

                        {isError ? <div className="text-sm text-red-600 dark:text-red-400">Failed to load applications.</div> : null}
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6 space-y-4">
                {filteredApplications.map((app) => (
                    <ApplicationCardRow
                        key={app.id}
                        app={app}
                        onNavigate={(id) => router.push(`/exec/applications/${ id }`)}
                        onDelete={deleteApplication}
                    />
                ))}

                {!isFetching && filteredApplications.length === 0 ? (
                    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
                        <CardContent className="p-8 text-center">
                            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">No applications found.</p>
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </main>
    );
}
