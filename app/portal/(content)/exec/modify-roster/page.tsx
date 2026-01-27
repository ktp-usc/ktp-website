"use client";

import React, { useMemo, useState } from "react";
import { leaderType as LeaderTypeEnum } from '@prisma/client';
import type { accounts, leaderType, type as accountType } from '@prisma/client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

import { useAccountsQuery, useDeleteAccountMutation, useUpdateAccountByIdMutation } from "@/client/hooks/accounts";
import { Trash2 } from 'lucide-react';

type RosterUiType = "Active" | "Exec" | "Applicant";

type AccountRow = Pick<
    accounts,
    "id" | "firstName" | "lastName" | "majors" | "gradYear" | "gradSemester" | "type" | "leaderType" | "isNew"
>;

type MemberRow = {
    id: string;
    name: string;
    classification: string;
    major: string;
    type: RosterUiType;
    execPosition: leaderType;
};

const EXEC_POSITIONS: { label: string; value: leaderType }[] = [
    { label: "President", value: "PRESIDENT" },
    { label: "Vice President", value: "VICE_PRESIDENT" },
    { label: "Executive Secretary", value: "SECRETARY" },
    { label: "Director of Outreach", value: "VP_OUTREACH" },
    { label: "Director of Marketing", value: "VP_MARKETING" },
    { label: "Director of Finance", value: "VP_FINANCE" },
    { label: "Director of Technical Development", value: "VP_TECHDEV" },
    { label: "Director of Professional Development", value: "VP_PROFDEV" },
    { label: "Director of Engagement", value: "VP_ENGAGEMENT" },
    { label: "Conferences & Hackathons Chair", value: "CHAIR_CONFERENCES" },
    { label: "Infrastructure Chair", value: "CHAIR_INFRASTRUCTURE" }
];

function fullName(a: AccountRow): string {
    const name = [a.firstName, a.lastName].filter(Boolean).join(" ").trim();
    return name || "—";
}

function majorLabel(a: AccountRow): string {
    return a.majors?.[0] ?? "—";
}

function classificationLabel(a: AccountRow): string {
    const sem = a.gradSemester ? (a.gradSemester === "SPRING" ? "Spring" : "Fall") : null;
    const year = a.gradYear ? String(a.gradYear) : null;
    return [sem, year].filter(Boolean).join(" ") || "—";
}

function rosterTypeFromAccount(a: AccountRow): RosterUiType {
    if (a.type === 'LEADERSHIP' || (a.leaderType && a.leaderType !== LeaderTypeEnum.N_A)) return 'Exec';
    if (a.isNew) return "Applicant";
    return "Active";
}

function execPositionFromAccount(a: AccountRow): leaderType {
    return a.leaderType ?? LeaderTypeEnum.N_A;
}

export default function ModifyRoster() {
    const { data, isLoading, isError } = useAccountsQuery();
    const accountItems = (data?.items ?? []) as unknown as AccountRow[];

    const updateAccount = useUpdateAccountByIdMutation();

    const memberRows: MemberRow[] = useMemo(() => {
        return accountItems
            .map((a) => ({
                id: a.id,
                name: fullName(a),
                classification: classificationLabel(a),
                major: majorLabel(a),
                type: rosterTypeFromAccount(a),
                execPosition: execPositionFromAccount(a)
            }));
    }, [accountItems]);

    const [activeFilter, setActiveFilter] = useState<"All" | RosterUiType>("All");

    const filteredMembers =
        activeFilter === "All" ? memberRows : memberRows.filter((m) => m.type === activeFilter);

    const handleTypeChange = (id: string, newType: RosterUiType) => {
        if (newType === "Active") {
            updateAccount.mutate({
                id,
                body: { type: "BROTHER" as accountType, isNew: false, leaderType: LeaderTypeEnum.N_A }
            });
            return;
        }

        if (newType === "Applicant") {
            updateAccount.mutate({
                id,
                body: { type: "APPLICANT" as accountType, isNew: true, leaderType: LeaderTypeEnum.N_A }
            });
            return;
        }

        // Exec
        updateAccount.mutate({
            id,
            body: { type: "LEADERSHIP" as accountType, isNew: false }
        });
    };

    const handlePositionChange = (id: string, position: leaderType) => {
        updateAccount.mutate({
            id,
            body: { leaderType: position, type: "LEADERSHIP" as accountType, isNew: false }
        });
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-transparent transition-colors duration-300">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white transition-colors duration-300">Modify Chapter Roster</h1>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Manage member types and executive positions for all chapter members.</p>
            </div>

            {/* Filter Tabs */ }
            <div className="mb-6 flex gap-2 flex-wrap">
                { (["All", "Active", "Exec", "Applicant"] as const).map((filter) => (
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
              ({ memberRows.filter((m) => (filter === "All" ? true : m.type === filter)).length })
            </span>
                    </Button>
                )) }
            </div>

            {/* Members Table */ }
            <Card>
                <CardHeader>
                    <CardTitle>
                        { activeFilter === "All" ? "All Members" : `${ activeFilter } Members` } ({ filteredMembers.length })
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    { isLoading ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">Loading roster…</div>
                    ) : isError ? (
                        <div className="text-center py-8 text-red-500 dark:text-red-400 transition-colors duration-300">Failed to load roster.</div>
                    ) : filteredMembers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">No members found in this category.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Classification</TableHead>
                                        <TableHead>Major</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Exec Position</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    { filteredMembers.map((member) => (
                                        <TableRow key={ member.id }>
                                            <TableCell className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">{ member.name }</TableCell>
                                            <TableCell
                                                className="text-sm capitalize text-gray-700 dark:text-gray-300 transition-colors duration-300">{ member.classification }</TableCell>
                                            <TableCell className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">{ member.major }</TableCell>

                                            {/* Type Selector */ }
                                            <TableCell>
                                                <Select
                                                    value={ member.type }
                                                    onValueChange={ (value) => handleTypeChange(member.id, value as RosterUiType) }
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Active">Active</SelectItem>
                                                        <SelectItem value="Exec">Exec</SelectItem>
                                                        <SelectItem value="Applicant">Applicant</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>

                                            {/* Exec Position */ }
                                            <TableCell>
                                                { member.type === "Exec" ? (
                                                    <Select
                                                        value={ member.execPosition }
                                                        onValueChange={ (value) => handlePositionChange(member.id, value as leaderType) }
                                                    >
                                                        <SelectTrigger className="w-40">
                                                            <SelectValue placeholder="Select position"/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="N_A">No Position</SelectItem>
                                                            { EXEC_POSITIONS.map((pos) => (
                                                                <SelectItem key={ pos.value } value={ pos.value }>
                                                                    { pos.label }
                                                                </SelectItem>
                                                            )) }
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">—</span>
                                                ) }
                                            </TableCell>
                                            <TableCell className="text-right">
                                              <DeleteAccountButton accountId={member.id} accountName={member.name} />
                                            </TableCell>
                                        </TableRow>
                                    )) }
                                </TableBody>
                            </Table>
                        </div>
                    ) }
                </CardContent>
            </Card>

            {/* Summary Stats */ }
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Active Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="text-3xl font-bold">{ memberRows.filter((m) => m.type === "Active").length }</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Exec Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{ memberRows.filter((m) => m.type === "Exec").length }</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Applicants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="text-3xl font-bold">{ memberRows.filter((m) => m.type === "Applicant").length }</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DeleteAccountButton({ accountId, accountName }: { accountId: string; accountName: string }) {
  const deleteAccount = useDeleteAccountMutation(accountId);

  return (
    <Button
      variant="ghost"
      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
      size="sm"
      onClick={() => {
        const ok = window.confirm(`Delete ${accountName}? This cannot be undone.`);
        if (!ok) return;
        deleteAccount.mutate();
      }}
      disabled={deleteAccount.isPending}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
