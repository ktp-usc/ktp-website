"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* ---------------- Types ---------------- */

type ApplicationStatus = 0 | 1 | 2 | 3 | 4 | 5;

type Application = {
    id: string;
    name: string;
    email: string;
    status: ApplicationStatus;
    flagged: boolean;
};

/* ---------------- Status Helpers ---------------- */

const STATUS_LABELS: Record<ApplicationStatus, string> = {
    0: "Closed",
    1: "Rejected",
    2: "Applied",
    3: "Interviewed",
    4: "Bid Offered",
    5: "Bid Accepted",
};

function StatusPill({ status }: { status: ApplicationStatus }) {
    const color =
        status === 5
            ? "bg-green-100 text-green-700"
            : status === 4
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700";

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
            {STATUS_LABELS[status]}
        </span>
    );
}

/* ---------------- Page ---------------- */

export default function ExecApplicationsPage() {
    const router = useRouter();

    const [applications, setApplications] = useState<Application[]>([
        {
            id: "1",
            name: "Emily Johnson",
            email: "emily.j@email.com",
            status: 4,
            flagged: true,
        },
        {
            id: "2",
            name: "Michael Brown",
            email: "mbrown@email.com",
            status: 2,
            flagged: false,
        },
        {
            id: "3",
            name: "John Smith",
            email: "john.smith@email.com",
            status: 5,
            flagged: false,
        },
    ]);

    const [search, setSearch] = useState("");
    const [sortByStatus, setSortByStatus] = useState(true);
    const [emailStatus, setEmailStatus] = useState<ApplicationStatus | "all">(
        "all"
    );

    /* ---------------- Derived Data ---------------- */

    const filteredApplications = useMemo(() => {
        let list = applications.filter((app) =>
            app.name.toLowerCase().includes(search.toLowerCase())
        );

        // Filter by status if not "all"
        if (emailStatus !== "all") {
            list = list.filter((app) => app.status === emailStatus);
        }

        if (sortByStatus) {
            list = [...list].sort((a, b) => b.status - a.status);
        }

        return list;
    }, [applications, search, sortByStatus, emailStatus]);


    const emailList = useMemo(() => {
        const list =
            emailStatus === "all"
                ? applications
                : applications.filter((a) => a.status === emailStatus);

        return list.map((a) => a.email).join("; ");
    }, [applications, emailStatus]);

    /* ---------------- Actions ---------------- */

    const toggleFlag = (id: string) => {
        setApplications((apps) =>
            apps.map((app) =>
                app.id === id ? { ...app, flagged: !app.flagged } : app
            )
        );
    };

    const deleteApplication = (id: string) => {
        setApplications((apps) => apps.filter((app) => app.id !== id));
    };

    const copyEmails = async () => {
        if (!emailList) {
            alert("No emails to copy");
            return;
        }
        await navigator.clipboard.writeText(emailList);
        alert("Emails copied to clipboard");
    };

    /* ---------------- Render ---------------- */

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Exec - Rush Applications</h1>
                        <Button variant="outline" onClick={() => router.push("/")}>
                            Home
                        </Button>
                    </div>
                    <p className="text-gray-600 mt-1">
                        Review and manage all rush applications.
                    </p>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border rounded-md px-4 py-2 w-64"
                    />

                    <Button
                        variant={sortByStatus ? "default" : "outline"}
                        onClick={() => setSortByStatus((v) => !v)}
                    >
                        Sort by Status (High → Low)
                    </Button>

                    <select
                        value={emailStatus}
                        onChange={(e) =>
                            setEmailStatus(
                                e.target.value === "all"
                                    ? "all"
                                    : (Number(e.target.value) as ApplicationStatus)
                            )
                        }
                        className="border rounded-md px-4 py-2"
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

                    <Button onClick={copyEmails}>Copy Emails</Button>
                </div>

                {/* Applications List */}
                <div className="space-y-4">
                    {filteredApplications.map((app) => (
                        <Card
                            key={app.id}
                            onClick={() => router.push(`/exec/applications/${app.id}`)}
                            className="cursor-pointer hover:shadow-md transition"
                        >
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-semibold">{app.name}</h2>
                                        <StatusPill status={app.status} />
                                        {app.flagged && (
                                            <span className="text-red-500 text-xs font-medium">
                                                Flagged
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{app.email}</p>
                                </div>

                                <div
                                    className="flex items-center gap-2"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => toggleFlag(app.id)}
                                    >
                                        {app.flagged ? "Unflag" : "Flag"}
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => deleteApplication(app.id)}
                                    >
                                        Delete
                                    </Button>

                                    <span className="text-gray-400 ml-2">›</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredApplications.length === 0 && (
                        <p className="text-gray-500 text-center py-10">
                            No applications found.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
