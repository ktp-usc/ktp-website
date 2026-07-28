"use client";

import React, { useMemo, useRef, useState } from "react";
import type { accounts } from '@prisma/client';
import { ExternalLink, FileText, Search, Trash2, Upload, User } from 'lucide-react';
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

import {
    useAllAccountsQuery,
    useDeleteResumeForAccountMutation,
    useUpdateAccountByIdMutation,
    useUploadResumeForAccountMutation
} from "@/client/hooks/accounts";

type BankRow = Pick<
    accounts,
    "id" | "firstName" | "lastName" | "majors" | "gradYear" | "linkedin" | "headshotBlobURL" | "resumeBlobURL" | "type"
>;

type BankFilter = "All" | "With Resume" | "Missing Resume";

// Removing a resume drops the member from the employer view: the employer routes only
// serve accounts that have a resumeBlobURL, with no other fallback.

type DraftRow = {
    majors: string;
    gradYear: string;
    linkedin: string;
};

function fullName(a: BankRow): string {
    const name = [a.firstName, a.lastName].filter(Boolean).join(" ").trim();
    return name || "Unknown Member";
}

function majorLabel(a: BankRow): string {
    return a.majors?.length ? a.majors.join(", ") : "No major listed";
}

function graduationLabel(a: BankRow): string {
    return a.gradYear ? `Class of ${ a.gradYear }` : "No grad year";
}

function draftFromRow(a: BankRow): DraftRow {
    return {
        majors: a.majors?.join(", ") ?? "",
        gradYear: a.gradYear ? String(a.gradYear) : "",
        linkedin: a.linkedin ?? ""
    };
}

export default function ExecResumeBank() {
    const { data, isLoading, isError } = useAllAccountsQuery();
    const updateAccount = useUpdateAccountByIdMutation();
    const uploadResume = useUploadResumeForAccountMutation();
    const deleteResume = useDeleteResumeForAccountMutation();

    const [activeFilter, setActiveFilter] = useState<BankFilter>("All");
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState<DraftRow | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    // one hidden input reused by every row; the row that opened it is tracked here
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const fileInputTargetId = useRef<string | null>(null);

    // the resume bank is the same population employers see: actives + exec
    const bankRows: BankRow[] = useMemo(() => {
        const items = (data?.items ?? []) as unknown as BankRow[];
        return items.filter((a) => a.type === "BROTHER" || a.type === "LEADERSHIP");
    }, [data?.items]);

    const matchesFilter = (a: BankRow, filter: BankFilter) => {
        if (filter === "All") return true;
        if (filter === "With Resume") return Boolean(a.resumeBlobURL);
        return !a.resumeBlobURL;
    };

    const filteredRows = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return bankRows.filter((a) => {
            const haystack = [fullName(a), majorLabel(a), graduationLabel(a)].join(" ").toLowerCase();
            return matchesFilter(a, activeFilter) && (!normalizedSearch || haystack.includes(normalizedSearch));
        });
    }, [activeFilter, bankRows, search]);

    const filters: BankFilter[] = ["All", "With Resume", "Missing Resume"];

    const pickResumeFile = (member: BankRow) => {
        setSaveError(null);
        fileInputTargetId.current = member.id;
        fileInputRef.current?.click();
    };

    const onResumeFileChosen = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const id = fileInputTargetId.current;

        // let the same file be re-picked later
        event.target.value = "";
        fileInputTargetId.current = null;

        if (!file || !id) return;

        if (file.type && !file.type.toLowerCase().includes("pdf")) {
            setSaveError("Resumes must be PDF files.");
            return;
        }

        uploadResume.mutate(
            { id, file },
            { onError: (e) => setSaveError(e.message || "Unable to upload that resume. Please try again.") }
        );
    };

    const removeResume = (member: BankRow) => {
        const name = fullName(member);

        if (!window.confirm(
            `Remove ${ name }'s resume?\n\nThey will no longer appear in the employer resume bank, and employers will lose access to the file. Their account and roster entry are not affected, and a new resume can be uploaded at any time.`
        )) return;

        setSaveError(null);

        deleteResume.mutate(
            { id: member.id },
            { onError: () => setSaveError(`Unable to remove ${ name }'s resume. Please try again.`) }
        );
    };

    const startEdit = (a: BankRow) => {
        setSaveError(null);
        setEditingId(a.id);
        setDraft(draftFromRow(a));
    };

    const cancelEdit = () => {
        setSaveError(null);
        setEditingId(null);
        setDraft(null);
    };

    const saveEdit = (id: string) => {
        if (!draft) return;

        const majors = draft.majors
            .split(",")
            .map((m) => m.trim())
            .filter(Boolean);

        const trimmedYear = draft.gradYear.trim();
        const parsedYear = Number.parseInt(trimmedYear, 10);

        if (trimmedYear && !Number.isFinite(parsedYear)) {
            setSaveError("Grad year must be a number.");
            return;
        }

        setSaveError(null);

        updateAccount.mutate(
            {
                id,
                body: {
                    majors,
                    // empty input leaves the stored year untouched — the API ignores nullish fields
                    gradYear: trimmedYear ? parsedYear : undefined,
                    linkedin: draft.linkedin.trim()
                }
            },
            {
                onSuccess: () => cancelEdit(),
                onError: () => setSaveError("Unable to save changes. Please try again.")
            }
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-transparent transition-colors duration-300">
            <input
                ref={ fileInputRef }
                type="file"
                accept="application/pdf,.pdf"
                onChange={ onResumeFileChosen }
                className="hidden"
            />

            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white transition-colors duration-300">
                    Resume Bank
                </h1>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Review the member resumes shared with approved employers, replace the file on record, or remove a
                    resume to drop that member from the employer view.
                </p>
            </div>

            {/* Filter Tabs */ }
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex gap-2 flex-wrap">
                    { filters.map((filter) => (
                        <Button
                            key={ filter }
                            variant={ activeFilter === filter ? "default" : "outline" }
                            onClick={ () => setActiveFilter(filter) }
                            className={
                                `cursor-pointer transition-colors ${
                                    activeFilter === filter
                                        ? ""
                                        : "text-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                                }`
                            }
                        >
                            { filter }
                            <span className="ml-2 text-sm font-semibold">
                                ({ bankRows.filter((a) => matchesFilter(a, filter)).length })
                            </span>
                        </Button>
                    )) }
                </div>

                <div className="relative w-full lg:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"/>
                    <Input
                        value={ search }
                        onChange={ (event) => setSearch(event.target.value) }
                        placeholder="Search by name, major, or year..."
                        className="pl-9"
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        { activeFilter === "All" ? "All Resumes" : activeFilter } ({ filteredRows.length })
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    { saveError ? (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                            { saveError }
                        </div>
                    ) : null }

                    { isLoading ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            Loading resume bank…
                        </div>
                    ) : isError ? (
                        <div className="text-center py-8 text-red-500 dark:text-red-400 transition-colors duration-300">
                            Failed to load resume bank.
                        </div>
                    ) : filteredRows.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            No resumes found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Classification</TableHead>
                                        <TableHead>Major</TableHead>
                                        <TableHead>LinkedIn</TableHead>
                                        <TableHead>Resume</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    { filteredRows.map((member) => {
                                        const memberName = fullName(member);
                                        const isEditing = editingId === member.id;
                                        const isSaving =
                                            isEditing &&
                                            updateAccount.isPending &&
                                            updateAccount.variables?.id === member.id;
                                        const isUploading =
                                            uploadResume.isPending && uploadResume.variables?.id === member.id;
                                        const isRemoving =
                                            deleteResume.isPending && deleteResume.variables?.id === member.id;
                                        const isBusy = isUploading || isRemoving;

                                        return (
                                            <TableRow key={ member.id }>
                                                <TableCell className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                                                    <div className="flex min-w-[180px] items-center gap-3">
                                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-blue-200 bg-white/30 transition-colors duration-300 dark:border-gray-600 dark:bg-gray-800">
                                                            { member.headshotBlobURL ? (
                                                                <Image
                                                                    src={ member.headshotBlobURL }
                                                                    alt={ `${ memberName } headshot` }
                                                                    width={ 40 }
                                                                    height={ 40 }
                                                                    className="h-10 w-10 object-cover"
                                                                />
                                                            ) : (
                                                                <User className="h-5 w-5 text-gray-700 dark:text-gray-200"/>
                                                            ) }
                                                        </span>
                                                        <span>{ memberName }</span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                                    { isEditing && draft ? (
                                                        <Input
                                                            value={ draft.gradYear }
                                                            onChange={ (event) => setDraft({ ...draft, gradYear: event.target.value }) }
                                                            placeholder="2027"
                                                            className="w-24"
                                                            inputMode="numeric"
                                                        />
                                                    ) : (
                                                        graduationLabel(member)
                                                    ) }
                                                </TableCell>

                                                <TableCell className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                                    { isEditing && draft ? (
                                                        <Input
                                                            value={ draft.majors }
                                                            onChange={ (event) => setDraft({ ...draft, majors: event.target.value }) }
                                                            placeholder="Computer Science, Math"
                                                            className="min-w-[200px]"
                                                        />
                                                    ) : (
                                                        majorLabel(member)
                                                    ) }
                                                </TableCell>

                                                <TableCell>
                                                    { isEditing && draft ? (
                                                        <Input
                                                            value={ draft.linkedin }
                                                            onChange={ (event) => setDraft({ ...draft, linkedin: event.target.value }) }
                                                            placeholder="https://linkedin.com/in/…"
                                                            className="min-w-[220px]"
                                                        />
                                                    ) : member.linkedin ? (
                                                        <Button asChild size="sm" variant="ghost">
                                                            <a href={ member.linkedin } target="_blank" rel="noreferrer">
                                                                <ExternalLink className="h-4 w-4"/>
                                                                LinkedIn
                                                            </a>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                                            Not listed
                                                        </span>
                                                    ) }
                                                </TableCell>

                                                <TableCell>
                                                    { member.resumeBlobURL ? (
                                                        <Button asChild size="sm" variant="outline">
                                                            <a href={ member.resumeBlobURL } target="_blank" rel="noreferrer">
                                                                <FileText className="h-4 w-4"/>
                                                                Resume
                                                            </a>
                                                        </Button>
                                                    ) : (
                                                        <Badge variant="secondary">Not uploaded</Badge>
                                                    ) }
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex justify-end gap-2">
                                                        { isEditing ? (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={ () => saveEdit(member.id) }
                                                                    disabled={ isSaving }
                                                                    className="cursor-pointer"
                                                                >
                                                                    { isSaving ? "Saving…" : "Save" }
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={ cancelEdit }
                                                                    disabled={ isSaving }
                                                                    className="cursor-pointer"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={ () => startEdit(member) }
                                                                    className="cursor-pointer"
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={ () => pickResumeFile(member) }
                                                                    disabled={ isBusy }
                                                                    className="cursor-pointer"
                                                                    title={
                                                                        member.resumeBlobURL
                                                                            ? "Replace the resume on file for this member"
                                                                            : "Upload a resume for this member"
                                                                    }
                                                                >
                                                                    <Upload className="h-4 w-4"/>
                                                                    { isUploading
                                                                        ? "Uploading…"
                                                                        : member.resumeBlobURL ? "Replace" : "Upload" }
                                                                </Button>
                                                                { member.resumeBlobURL ? (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={ () => removeResume(member) }
                                                                        disabled={ isBusy }
                                                                        className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                                                        title="Remove this resume, dropping the member from the employer resume bank"
                                                                    >
                                                                        <Trash2 className="h-4 w-4"/>
                                                                        { isRemoving ? "Removing…" : "Remove" }
                                                                    </Button>
                                                                ) : null }
                                                            </>
                                                        ) }
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }) }
                                </TableBody>
                            </Table>
                        </div>
                    ) }
                </CardContent>
            </Card>
        </div>
    );
}
