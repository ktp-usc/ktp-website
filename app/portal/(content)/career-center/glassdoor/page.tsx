"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMyAccountQuery } from "@/client/hooks/accounts";
import { hasExecAccess } from "@/lib/auth/roles";

type Review = {
    id: string;
    company: string;
    role: string;
    location: string;
    appTimeline: string;
    interviewQs: string[];
    technicalDetails: string;
    canRefer: boolean;
    pros: string;
    cons: string;
    advice: string;
    authorName: string;
    authorId: string;
    createdAt: string;
};

export default function GlassdoorPage() {
    const { data: myAccount } = useMyAccountQuery();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterReferral, setFilterReferral] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const emptyForm = {
        company: "", role: "", location: "",
        appTimeline: "", interviewQuestions: "", technicalDetails: "",
        canRefer: false, pros: "", cons: "", advice: "",
    };

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        fetch("/api/career/reviews")
            .then((res) => res.json())
            .then((data) => {
                setReviews(data.reviews ?? []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await fetch("/api/career/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setReviews((prev) => [data.review, ...prev]);
                setForm(emptyForm);
                setShowForm(false);
            } else {
                alert(data.error ?? "Failed to submit");
            }
        } catch {
            alert("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (r: Review) => {
        setEditingId(r.id);
        setForm({
            company: r.company,
            role: r.role,
            location: r.location,
            appTimeline: r.appTimeline,
            interviewQuestions: r.interviewQs.join("\n"),
            technicalDetails: r.technicalDetails,
            canRefer: r.canRefer,
            pros: r.pros,
            cons: r.cons,
            advice: r.advice,
        });
        setShowForm(true);
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/career/reviews/${editingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setReviews((prev) =>
                    prev.map((r) => (r.id === editingId ? data.review : r))
                );
                setForm(emptyForm);
                setShowForm(false);
                setEditingId(null);
            } else {
                alert(data.error ?? "Failed to update");
            }
        } catch {
            alert("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/career/reviews/${id}`, { method: "DELETE" });
            if (res.ok) {
                setReviews((prev) => prev.filter((r) => r.id !== id));
                setDeleteConfirmId(null);
            } else {
                alert("Failed to delete");
            }
        } catch {
            alert("Something went wrong");
        }
    };

    const canEditOrDelete = (r: Review) => {
        if (!myAccount) return false;
        return r.authorId === myAccount.id || hasExecAccess(myAccount.type);
    };

    const filtered = reviews.filter((r) => {
        const q = search.toLowerCase();
        const matchesSearch =
            r.company.toLowerCase().includes(q) ||
            r.role.toLowerCase().includes(q) ||
            r.location.toLowerCase().includes(q);
        const matchesReferral = filterReferral ? r.canRefer : true;
        return matchesSearch && matchesReferral;
    });

    return (
        <main className="max-w-5xl mx-auto px-6 py-8">
            {/* Back link */}
            <a
                href="/portal/career-center"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline mb-4"
            >
                &larr; Back to Career Center
            </a>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Company Experiences
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Browse company reviews and interview experiences from brothers.
                    </p>
                </div>
                <Button onClick={() => {
                    setShowForm(!showForm);
                    setEditingId(null);
                    setForm(emptyForm);
                }}>
                    {showForm ? "Cancel" : "+ Add Experience"}
                </Button>
            </div>

            {/* Submit / Edit Form */}
            {showForm && (
                <Card className="mb-8 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle>{editingId ? "Edit Experience" : "Share Your Experience"}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Internship Role</label>
                            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Application Timeline</label>
                            <Input value={form.appTimeline} onChange={(e) => setForm({ ...form, appTimeline: e.target.value })} />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Interview Questions Asked</label>
                            <Textarea value={form.interviewQuestions} onChange={(e) => setForm({ ...form, interviewQuestions: e.target.value })} />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Technical Assessment Details</label>
                            <Textarea value={form.technicalDetails} onChange={(e) => setForm({ ...form, technicalDetails: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Pros</label>
                            <Textarea value={form.pros} onChange={(e) => setForm({ ...form, pros: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cons</label>
                            <Textarea value={form.cons} onChange={(e) => setForm({ ...form, cons: e.target.value })} />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Advice for Applicants</label>
                            <Textarea value={form.advice} onChange={(e) => setForm({ ...form, advice: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-6 md:col-span-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input type="checkbox" checked={form.canRefer} onChange={(e) => setForm({ ...form, canRefer: e.target.checked })} className="rounded" />
                                I can refer brothers to this company
                            </label>
                        </div>
                        <div className="md:col-span-2">
                            <Button
                                className="w-full"
                                onClick={editingId ? handleUpdate : handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? "Saving..." : editingId ? "Save Changes" : "Submit Experience"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search + Filter */}
            <div className="flex gap-3 mb-6">
                <Input
                    placeholder="Search by company, role, or city..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-md"
                />
                <Button
                    variant={filterReferral ? "default" : "outline"}
                    onClick={() => setFilterReferral(!filterReferral)}
                >
                    Referral Available
                </Button>
            </div>

            {/* Results count */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {loading ? "Loading..." : `${filtered.length} ${filtered.length === 1 ? "experience" : "experiences"} · sorted by most recent`}
            </p>

            {/* Review Cards */}
            <div className="space-y-4">
                {!loading && filtered.length === 0 && (
                    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        No experiences found. Be the first to add one!
                    </div>
                )}
                {filtered.map((r) => (
                    <Card key={r.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <CardContent className="pt-6 pb-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{r.company}</h3>
                                        {r.canRefer && (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                Referral Available
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {r.role} &mdash; {r.location}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                    {canEditOrDelete(r) && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(r)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => setDeleteConfirmId(r.id)}
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 mb-4" />

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Application Timeline</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{r.appTimeline}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Posted By</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{r.authorName}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 mb-4" />

                            <button
                                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {expanded === r.id ? "Show less" : "Show full details"}
                            </button>

                            {expanded === r.id && (
                                <div className="mt-6 space-y-8">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">
                                            Interview Questions
                                        </p>
                                        <ul className="space-y-3">
                                            {r.interviewQs.map((q, i) => (
                                                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-blue-200 dark:border-blue-800 py-1">
                                                    {q}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Technical Assessment</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{r.technicalDetails}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 mb-2">Pros</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{r.pros}</p>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-red-500 dark:text-red-400 mb-2">Cons</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{r.cons}</p>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">Advice for Applicants</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{r.advice}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Delete Review
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete this review? This cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleDelete(deleteConfirmId)}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
