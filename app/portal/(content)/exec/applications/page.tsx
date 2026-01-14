'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import type { applicationStatus } from '@prisma/client';

import { fetchJson } from '@/client/api/fetcher';
import { qk } from '@/client/queries/keys';
import { useApplicationsQuery } from '@/client/hooks/applications';

/* ---------------- Types ---------------- */

type ApplicationStatusUI = 0 | 1 | 2 | 3 | 4 | 5;

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
    1: 'Rejected',
    2: 'Applied',
    3: 'Interviewed',
    4: 'Bid Offered',
    5: 'Bid Accepted'
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
            return 3;
        case 'INTERVIEW':
            return 3;
        case 'BID_OFFERED':
            return 4;
        case 'BID_ACCEPTED':
            return 5;
        default:
            return 2;
    }
}

function deriveUiStatus(app: any): ApplicationStatusUI {
    // ✅ new schema field name is `statusOverride` (lowercase)
    // this assumes your API returns comments sorted newest-first
    const latestOverride = app.comments?.[0]?.statusOverride ?? null;
    if (latestOverride) return mapOverrideToUi(latestOverride);

    // fallback: if submittedAt exists, treat as applied
    if (app.submittedAt) return 2;
    return 2;
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

/* ---------------- Page ---------------- */

export default function ExecApplicationsPage() {
    const router = useRouter();
    const qc = useQueryClient();

    // ✅ new hook returns { items, total }
    const { data, isFetching, isError } = useApplicationsQuery({});
    const apps = data?.items ?? [];

    const [search, setSearch] = useState('');
    const [sortByStatus, setSortByStatus] = useState(true);
    const [emailStatus, setEmailStatus] = useState<ApplicationStatusUI | 'all'>('all');

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

        if (sortByStatus) {
            list = [...list].sort((a, b) => b.status - a.status);
        }

        return list;
    }, [applications, search, sortByStatus, emailStatus]);

    const emailList = useMemo(() => {
        const list = emailStatus === 'all' ? applications : applications.filter((a) => a.status === emailStatus);
        return list.map((a) => a.email).join('; ');
    }, [applications, emailStatus]);

    // ✅ new spec: PATCH /api/applications/[id]/flag { isFlagged: boolean }
    const setFlagMutation = useMutation({
        mutationFn: ({ id, isFlagged }: { id: string; isFlagged: boolean }) =>
            fetchJson(`/api/applications/${id}/flag`, {
                method: 'PATCH',
                body: JSON.stringify({ isFlagged })
            }),
        onSuccess: async (_data, vars) => {
            await qc.invalidateQueries({ queryKey: qk.application(vars.id) });
            await qc.invalidateQueries({ queryKey: qk.applications({}) });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id }: { id: string }) => fetchJson(`/api/applications/${id}`, { method: 'DELETE' }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: qk.applications({}) });
        }
    });

    const toggleFlag = (id: string) => {
        const app = applications.find((a) => a.id === id);
        if (!app) return;

        const next = !app.flagged;
        const confirmed = window.confirm(next ? 'Flag this application?' : 'Remove flag from this application?');
        if (!confirmed) return;

        setFlagMutation.mutate({ id, isFlagged: next });
    };

    const deleteApplication = (id: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this application? This cannot be undone.');
        if (!confirmed) return;

        deleteMutation.mutate({ id });
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
                            <Button variant={sortByStatus ? 'default' : 'outline'} onClick={() => setSortByStatus((v) => !v)}>
                                Sort by Status (High → Low)
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
                    <Card
                        key={app.id}
                        onClick={() => router.push(`/portal/exec/applications/${app.id}`)}
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
                                        onClick={() => toggleFlag(app.id)}
                                        disabled={setFlagMutation.isPending}
                                    >
                                        {app.flagged ? 'Unflag' : 'Flag'}
                                    </Button>

                                    <Button
                                        size="sm"
                                        className="h-8 px-3"
                                        variant="destructive"
                                        onClick={() => deleteApplication(app.id)}
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
