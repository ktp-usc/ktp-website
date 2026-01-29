"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useMyAccountQuery } from "@/client/hooks/accounts";
import { useRusheesQuery, useUpsertRusheeCommentMutation } from "@/client/hooks/rushees";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function statusLabel(status: string) {
    return status.replace(/_/g, " ");
}

export default function RusheesPage() {
    const { data: myAccount, isLoading: accountLoading, isError: accountError } = useMyAccountQuery();
    const isBrother = myAccount?.type === "BROTHER";

    const rusheesQuery = useRusheesQuery(Boolean(isBrother));
    const upsertComment = useUpsertRusheeCommentMutation();

    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!rusheesQuery.data?.items) return;
        setDrafts((prev) => {
            const next = { ...prev };
            for (const item of rusheesQuery.data.items) {
                if (next[item.accountId] == null) {
                    next[item.accountId] = item.myComment?.body ?? "";
                }
            }
            return next;
        });
    }, [rusheesQuery.data?.items]);

    const content = useMemo(() => {
        if (accountLoading) {
            return <div className="text-center py-16 text-gray-600 dark:text-gray-300">Loading…</div>;
        }

        if (accountError || !myAccount) {
            return (
                <Card className="max-w-xl mx-auto">
                    <CardHeader>
                        <CardTitle>Sign in required</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            This page is only available to active members.
                        </p>
                        <Button asChild>
                            <Link href="/auth/sign-in">Go to sign in</Link>
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        if (!isBrother) {
            return (
                <Card className="max-w-xl mx-auto">
                    <CardHeader>
                        <CardTitle>Active members only</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            This page is only available to active members. Please sign in with an active account.
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/auth/sign-in">Go to sign in</Link>
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        if (rusheesQuery.isLoading) {
            return <div className="text-center py-16 text-gray-600 dark:text-gray-300">Loading rushees…</div>;
        }

        if (rusheesQuery.isError) {
            return (
                <div className="text-center py-16 text-red-600 dark:text-red-400">
                    Failed to load rushees.
                </div>
            );
        }

        const items = rusheesQuery.data?.items ?? [];
        const normalizedQuery = search.trim().toLowerCase();
        const filteredItems = normalizedQuery
            ? items.filter((item) => item.fullName.toLowerCase().includes(normalizedQuery))
            : items;

        if (items.length === 0) {
            return <div className="text-center py-16 text-gray-600 dark:text-gray-300">No rushees found.</div>;
        }

        return (
            <div className="grid gap-6">
                {filteredItems.map((item) => {
                    const draft = drafts[item.accountId] ?? "";
                    const saved = item.myComment?.body ?? "";
                    const isDirty = draft.trim() !== saved.trim();
                    const canComment = Boolean(item.applicationId);

                    return (
                        <Card key={item.accountId}>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center text-xs text-gray-500">
                                    {item.headshotUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={item.headshotUrl}
                                            alt={item.fullName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        "No Photo"
                                    )}
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{item.fullName}</CardTitle>
                                    <Badge variant="secondary" className="mt-2 uppercase tracking-wide">
                                        {statusLabel(item.status)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Textarea
                                    value={draft}
                                    onChange={(e) =>
                                        setDrafts((prev) => ({ ...prev, [item.accountId]: e.target.value }))
                                    }
                                    placeholder="Write your rush impression…"
                                    className="min-h-20 text-lg"
                                    disabled={!canComment}
                                />
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {!canComment
                                            ? "No application on file yet."
                                            : item.myComment
                                                ? "Your comment is saved."
                                                : ""}
                                    </p>
                                    <Button
                                        onClick={() =>
                                            item.applicationId
                                                ? upsertComment.mutate({ applicationId: item.applicationId, body: draft })
                                                : null
                                        }
                                        disabled={
                                            !canComment || upsertComment.isPending || !draft.trim() || !isDirty
                                        }
                                    >
                                        {item.myComment ? "Update Comment" : "Save Comment"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    }, [accountLoading, accountError, myAccount, isBrother, rusheesQuery, drafts, upsertComment, search]);

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Rushee Impressions</h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Leave your thoughts or interview evaluations! One comment per rushee, please.
                </p>
                {isBrother ? (
                    <div className="mt-4">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search applicants by name…"
                            className="max-w-sm"
                        />
                    </div>
                ) : null}
            </div>
            {content}
        </div>
    );
}
