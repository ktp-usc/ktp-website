"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Review = {
    id: number;
    company: string;
    industry: string;
    role: string;
    location: string;
    appTimeline: string;
    interviewQuestions: string[];
    technicalDetails: string;
    canRefer: boolean;
    compensation: string;
    pros: string;
    cons: string;
    advice: string;
    author: string;
    createdAt: string;
};

const SAMPLE: Review[] = [
    {
        id: 1,
        company: "JP Morgan",
        industry: "Finance",
        role: "SWE Intern",
        location: "New York, NY",
        appTimeline: "Applied Oct, heard back Nov, interviewed Dec",
        interviewQuestions: [
            "Why JP Morgan?",
            "Tell me about a time you led a project",
            "LeetCode medium array problem",
        ],
        technicalDetails: "One HackerRank OA (2 questions, 90 min), then 2 technical rounds",
        canRefer: true,
        compensation: "$52/hr",
        pros: "Great brand name, solid pay, good mentorship",
        cons: "Slow-paced for tech",
        advice: "Know your behavioral stories cold. Study arrays and hashmaps.",
        author: "Anonymous Person   ",
        createdAt: "Jun 3, 2026",
    },
];

export default function CareerCenterPage() {
    const [reviews] = useState<Review[]>(SAMPLE);
    const [search, setSearch] = useState("");
    const [filterReferral, setFilterReferral] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [expanded, setExpanded] = useState<number | null>(null);

    const [form, setForm] = useState({
        company: "",
        industry: "",
        role: "",
        location: "",
        appTimeline: "",
        interviewQuestions: "",
        technicalDetails: "",
        canRefer: false,
        compensation: "",
        pros: "",
        cons: "",
        advice: "",
    });

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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Career Center
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Browse company reviews and interview experiences from brothers.
                    </p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "+ Add Experience"}
                </Button>
            </div>

            {/* Submit Form */}
            {showForm && (
                <Card className="mb-8 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle>Share Your Experience</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Company Name
                            </label>
                            <Input
                                placeholder="e.g. Google"
                                value={form.company}
                                onChange={(e) => setForm({ ...form, company: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Industry
                            </label>
                            <Input
                                placeholder="e.g. Tech, Finance, Consulting"
                                value={form.industry}
                                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Internship Role
                            </label>
                            <Input
                                placeholder="e.g. SWE Intern"
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Location
                            </label>
                            <Input
                                placeholder="e.g. New York, NY"
                                value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Application Timeline
                            </label>
                            <Input
                                placeholder="e.g. Applied Oct, heard back Nov"
                                value={form.appTimeline}
                                onChange={(e) => setForm({ ...form, appTimeline: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Compensation
                            </label>
                            <Input
                                placeholder="e.g. $45/hr"
                                value={form.compensation}
                                onChange={(e) => setForm({ ...form, compensation: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Interview Questions Asked
                            </label>
                            <Textarea
                                placeholder="List the questions you were asked, one per line"
                                value={form.interviewQuestions}
                                onChange={(e) => setForm({ ...form, interviewQuestions: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Technical Assessment Details
                            </label>
                            <Textarea
                                placeholder="OA format, number of rounds, difficulty, topics covered"
                                value={form.technicalDetails}
                                onChange={(e) => setForm({ ...form, technicalDetails: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Pros
                            </label>
                            <Textarea
                                placeholder="What was good about the company / role?"
                                value={form.pros}
                                onChange={(e) => setForm({ ...form, pros: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Cons
                            </label>
                            <Textarea
                                placeholder="What could be better?"
                                value={form.cons}
                                onChange={(e) => setForm({ ...form, cons: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Advice for Applicants
                            </label>
                            <Textarea
                                placeholder="What would you tell someone applying here?"
                                value={form.advice}
                                onChange={(e) => setForm({ ...form, advice: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-6 md:col-span-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.canRefer}
                                    onChange={(e) => setForm({ ...form, canRefer: e.target.checked })}
                                    className="rounded"
                                />
                                I can refer brothers to this company
                            </label>
                        </div>
                        <div className="md:col-span-2">
                            <Button className="w-full">Submit Experience</Button>
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
                {filtered.length} {filtered.length === 1 ? "experience" : "experiences"} · sorted by most recent
            </p>

            {/* Review Cards */}
            <div className="space-y-4">
                {filtered.length === 0 && (
                    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        No experiences found. Be the first to add one!
                    </div>
                )}
                {filtered.map((r) => (
                    <Card
                        key={r.id}
                        className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                        <CardContent className="pt-6">
                            {/* Top row */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {r.company}
                                        </h3>
                                        <Badge variant="secondary">{r.industry}</Badge>
                                        {r.canRefer && (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                Referral Available
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {r.role} · {r.location}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                                    {r.createdAt}
                                </span>
                            </div>

                            {/* Quick info */}
                            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3 flex-wrap">
                                <span>💰 {r.compensation}</span>
                                <span>📅 {r.appTimeline}</span>
                                <span>👤 {r.author}</span>
                            </div>

                            {/* Expand toggle */}
                            <button
                                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {expanded === r.id ? "Show less ▲" : "Show full details ▼"}
                            </button>

                            {/* Expanded details */}
                            {expanded === r.id && (
                                <div className="mt-4 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                            Interview Questions
                                        </p>
                                        <ul className="list-disc list-inside space-y-1">
                                            {r.interviewQuestions.map((q, i) => (
                                                <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                                                    {q}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                            Technical Assessment
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {r.technicalDetails}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                                Pros
                                            </p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{r.pros}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                                Cons
                                            </p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{r.cons}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                            Advice for Applicants
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{r.advice}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </main>
    );
}