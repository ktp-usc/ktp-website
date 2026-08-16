"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { leaderType as LeaderTypeEnum } from "@prisma/client";
import type { accounts, gradSemester, leaderType, type as accountType } from "@prisma/client";
import { toast } from "sonner";
import { Trash2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

import {
    useAllAccountsQuery,
    useDeleteAccountMutation,
    useUpdateAccountByIdMutation,
    useUploadAccountHeadshotMutation
} from "@/client/hooks/accounts";
import HeadshotCropModal from "@/app/portal/settings/HeadshotCropModal";

type RosterUiType = "Active" | "Exec" | "Chair" | "Alumni" | "Applicant" | "PNM" | "NULL";
type RosterFilter = "All Members" | "All Actives" | RosterUiType | "All Accounts";

const ROSTER_FILTERS: RosterFilter[] = [
    "All Members",
    "All Actives",
    "Active",
    "Exec",
    "Chair",
    "Alumni",
    "Applicant",
    "PNM",
    "NULL",
    "All Accounts"
];

const ROSTER_TYPES: RosterUiType[] = [
    "Active",
    "Exec",
    "Chair",
    "Alumni",
    "Applicant",
    "PNM",
    "NULL"
];

type AccountRow = Pick<
    accounts,
    | "id"
    | "firstName"
    | "lastName"
    | "majors"
    | "minors"
    | "gradYear"
    | "gradSemester"
    | "type"
    | "leaderType"
    | "isNew"
    | "headshotBlobURL"
    | "schoolEmail"
    | "personalEmail"
>;

type MemberRow = {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    schoolEmail: string | null;
    personalEmail: string | null;
    majors: string[];
    minors: string[];
    gradYear: number | null;
    gradSemester: gradSemester | null;
    type: RosterUiType;
    execPosition: leaderType;
    headshotBlobURL: string | null;
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
    { label: "Director of Engagement", value: "VP_ENGAGEMENT" }
];

const CHAIR_POSITIONS: { label: string; value: leaderType }[] = [
    { label: "Infrastructure Chair", value: "CHAIR_INFRASTRUCTURE" },
    { label: "Conferences Chair", value: "CHAIR_CONFERENCES" },
    { label: "Hackathon Chair", value: "CHAIR_HACKATHON" },
    { label: "Placement Chair", value: "CHAIR_PLACEMENT" },
    { label: "PGC Delegate", value: "DELEGATE_PGC" },
    { label: "Communications Chair", value: "CHAIR_COMMUNICATIONS" },
    { label: "Nationals Delegate", value: "DELEGATE_NATIONALS" }
];

const CHAIR_POSITION_VALUES = new Set<leaderType>(CHAIR_POSITIONS.map((p) => p.value));
const EXEC_POSITION_VALUES = new Set<leaderType>(EXEC_POSITIONS.map((p) => p.value));

function fullName(a: AccountRow): string {
    const name = [a.firstName, a.lastName].filter(Boolean).join(" ").trim();
    return name || "—";
}

function rosterTypeFromAccount(a: AccountRow): RosterUiType {
    switch (a.type) {
        case "LEADERSHIP":
            return "Exec";
        case "CHAIR":
            return "Chair";
        case "BROTHER":
            return "Active";
        case "ALUMNI":
            return "Alumni";
        case "APPLICANT":
            return "Applicant";
        case "PNM":
            return "PNM";
        default:
            return "NULL";
    }
}

function execPositionFromAccount(a: AccountRow): leaderType {
    return a.leaderType ?? LeaderTypeEnum.N_A;
}

function parseMajors(value: string): string[] {
    return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

function matchesFilter(type: RosterUiType, filter: RosterFilter): boolean {
    if (filter === "All Accounts") return true;
    if (filter === "All Members") return type !== "Applicant" && type !== "NULL";
    if (filter === "All Actives") return type !== "Applicant" && type !== "NULL" && type !== "PNM";
    return type === filter;
}

export default function ModifyRoster() {
    const { data, isLoading, isError } = useAllAccountsQuery();
    const accountItems = (data?.items ?? []) as unknown as AccountRow[];

    const updateAccount = useUpdateAccountByIdMutation();
    const uploadHeadshot = useUploadAccountHeadshotMutation();

    const [isDark, setIsDark] = useState(false);
    const [cropAccountId, setCropAccountId] = useState<string | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    const memberRows: MemberRow[] = useMemo(() => {
        return accountItems.map((a) => ({
            id: a.id,
            name: fullName(a),
            firstName: a.firstName ?? "",
            lastName: a.lastName ?? "",
            schoolEmail: a.schoolEmail ?? null,
            personalEmail: a.personalEmail ?? null,
            majors: a.majors ?? [],
            minors: a.minors ?? [],
            gradYear: a.gradYear ?? null,
            gradSemester: a.gradSemester ?? null,
            type: rosterTypeFromAccount(a),
            execPosition: execPositionFromAccount(a),
            headshotBlobURL: a.headshotBlobURL ?? null
        }));
    }, [accountItems]);

    const [activeFilter, setActiveFilter] = useState<RosterFilter>("All Members");
    const [search, setSearch] = useState("");

    const filteredMembers = useMemo(() => {
        const q = search.trim().toLowerCase();
        return memberRows.filter((m) => {
            if (!matchesFilter(m.type, activeFilter)) return false;
            if (!q) return true;
            const haystack = [m.firstName, m.lastName, m.name, m.schoolEmail, m.personalEmail]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [memberRows, activeFilter, search]);

    const patchAccount = (id: string, body: Partial<Record<string, unknown>>) => {
        updateAccount.mutate(
            { id, body },
            {
                onSuccess: () => toast.success("Saved"),
                onError: () => toast.error("Failed to save")
            }
        );
    };

    const handleTypeChange = (id: string, newType: RosterUiType) => {
        const current = accountItems.find((a) => a.id === id);
        const currentPos = current?.leaderType ?? LeaderTypeEnum.N_A;

        if (newType === "Active") {
            patchAccount(id, { type: "BROTHER" as accountType, isNew: false, leaderType: LeaderTypeEnum.N_A });
            return;
        }

        if (newType === "Applicant") {
            patchAccount(id, { type: "APPLICANT" as accountType, isNew: true, leaderType: LeaderTypeEnum.N_A });
            return;
        }

        if (newType === "Chair") {
            const leaderType = CHAIR_POSITION_VALUES.has(currentPos) ? currentPos : LeaderTypeEnum.N_A;
            patchAccount(id, { type: "CHAIR" as accountType, isNew: false, leaderType });
            return;
        }

        if (newType === "Alumni") {
            patchAccount(id, { type: "ALUMNI" as accountType, isNew: false, leaderType: LeaderTypeEnum.N_A });
            return;
        }

        if (newType === "PNM") {
            patchAccount(id, { type: "PNM" as accountType, isNew: true, leaderType: LeaderTypeEnum.N_A });
            return;
        }

        if (newType === "NULL") {
            patchAccount(id, { type: null, isNew: null, leaderType: LeaderTypeEnum.N_A });
            return;
        }

        const leaderType = EXEC_POSITION_VALUES.has(currentPos) ? currentPos : LeaderTypeEnum.N_A;
        patchAccount(id, { type: "LEADERSHIP" as accountType, isNew: false, leaderType });
    };

    const handlePositionChange = (id: string, position: leaderType, rosterType: RosterUiType) => {
        if (rosterType === "Chair" || CHAIR_POSITION_VALUES.has(position)) {
            patchAccount(id, { leaderType: position, type: "CHAIR" as accountType, isNew: false });
            return;
        }

        patchAccount(id, { leaderType: position, type: "LEADERSHIP" as accountType, isNew: false });
    };

    const handleGradSemesterChange = (id: string, value: string) => {
        patchAccount(id, { gradSemester: value === "none" ? null : (value as gradSemester) });
    };

    const handleGradYearChange = (id: string, value: string) => {
        const trimmed = value.trim();
        if (trimmed === "") {
            patchAccount(id, { gradYear: null });
            return;
        }

        const year = Number.parseInt(trimmed, 10);
        if (!Number.isFinite(year) || trimmed.length !== 4) return;

        patchAccount(id, { gradYear: year });
    };

    const handleMajorsBlur = (id: string, currentMajors: string[], value: string) => {
        const next = parseMajors(value);
        if (next.join(", ") === currentMajors.join(", ")) return;
        patchAccount(id, { majors: next });
    };

    const handleMinorsBlur = (id: string, currentMinors: string[], value: string) => {
        const next = parseMajors(value);
        if (next.join(", ") === currentMinors.join(", ")) return;
        patchAccount(id, { minors: next });
    };

    const handleNameBlur = (
        id: string,
        currentFirst: string,
        currentLast: string,
        first: string,
        last: string
    ) => {
        const firstName = first.trim();
        const lastName = last.trim();
        if (firstName === currentFirst && lastName === currentLast) return;
        patchAccount(id, { firstName, lastName });
    };

    const handleHeadshotPick = (id: string, file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            setCropAccountId(id);
            setImageSrc(reader.result as string);
            setOriginalFile(file);
        };
        reader.readAsDataURL(file);
    };

    const closeCropModal = () => {
        setCropAccountId(null);
        setImageSrc(null);
        setOriginalFile(null);
    };

    const filterCount = (filter: RosterFilter) =>
        memberRows.filter((m) => matchesFilter(m.type, filter)).length;

    return (
        <div className="w-full px-6 py-8 bg-transparent transition-colors duration-300">
            <HeadshotCropModal
                open={Boolean(cropAccountId && imageSrc)}
                imageSrc={imageSrc}
                isDark={isDark}
                originalFile={originalFile}
                onCancelAction={closeCropModal}
                onSaveAction={async (croppedFile) => {
                    if (!cropAccountId) return;
                    try {
                        await uploadHeadshot.mutateAsync({ id: cropAccountId, file: croppedFile });
                        toast.success("Headshot updated.");
                        closeCropModal();
                    } catch (error) {
                        console.error(error);
                        toast.error("Failed to upload headshot");
                    }
                }}
            />

            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white transition-colors duration-300">Modify Chapter Roster</h1>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Update member photos, graduation dates, majors, minors, types, and positions.</p>
            </div>

            <div className="mb-4">
                <Input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    className="max-w-sm bg-white dark:bg-gray-900"
                />
            </div>

            <div className="mb-6 flex gap-2 flex-wrap">
                {ROSTER_FILTERS.map((filter) => (
                    <Button
                        key={filter}
                        variant={activeFilter === filter ? "default" : "outline"}
                        onClick={() => setActiveFilter(filter)}
                        className={
                            `cursor-pointer transition-colors ${
                                activeFilter === filter
                                    ? ""
                                    : "text-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                            }`
                        }
                    >
                        {filter}
                        <span className="ml-2 text-sm font-semibold">
                            ({filterCount(filter)})
                        </span>
                    </Button>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {activeFilter} ({filteredMembers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">Loading roster…</div>
                    ) : isError ? (
                        <div className="text-center py-8 text-red-500 dark:text-red-400 transition-colors duration-300">Failed to load roster.</div>
                    ) : filteredMembers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">No members found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Photo</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Grad Date</TableHead>
                                        <TableHead>Major</TableHead>
                                        <TableHead>Minor</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredMembers.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <PhotoPicker
                                                    accountId={member.id}
                                                    name={member.name}
                                                    headshotUrl={member.headshotBlobURL}
                                                    disabled={uploadHeadshot.isPending}
                                                    onPick={handleHeadshotPick}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <NameInputs
                                                    accountId={member.id}
                                                    firstName={member.firstName}
                                                    lastName={member.lastName}
                                                    onCommit={handleNameBlur}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 min-w-[11rem]">
                                                    <Select
                                                        value={member.gradSemester ?? "none"}
                                                        onValueChange={(value) => handleGradSemesterChange(member.id, value)}
                                                    >
                                                        <SelectTrigger className="w-24">
                                                            <SelectValue placeholder="Sem" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">—</SelectItem>
                                                            <SelectItem value="FALL">Fall</SelectItem>
                                                            <SelectItem value="SPRING">Spring</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <GradYearInput
                                                        accountId={member.id}
                                                        gradYear={member.gradYear}
                                                        onCommit={handleGradYearChange}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <CommaListInput
                                                    accountId={member.id}
                                                    items={member.majors}
                                                    placeholder="Major(s)"
                                                    onCommit={handleMajorsBlur}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <CommaListInput
                                                    accountId={member.id}
                                                    items={member.minors}
                                                    placeholder="Minor(s)"
                                                    onCommit={handleMinorsBlur}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={member.type}
                                                    onValueChange={(value) => handleTypeChange(member.id, value as RosterUiType)}
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ROSTER_TYPES.map((type) => (
                                                            <SelectItem key={type} value={type}>
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                {member.type === "Exec" || member.type === "Chair" ? (
                                                    <Select
                                                        value={member.execPosition}
                                                        onValueChange={(value) => handlePositionChange(member.id, value as leaderType, member.type)}
                                                    >
                                                        <SelectTrigger className="w-48">
                                                            <SelectValue placeholder="Select position" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="N_A">No Position</SelectItem>
                                                            {(member.type === "Chair" ? CHAIR_POSITIONS : EXEC_POSITIONS).map((pos) => (
                                                                <SelectItem key={pos.value} value={pos.value}>
                                                                    {pos.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DeleteAccountButton accountId={member.id} accountName={member.name} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function NameInputs({
    accountId,
    firstName,
    lastName,
    onCommit
}: {
    accountId: string;
    firstName: string;
    lastName: string;
    onCommit: (id: string, currentFirst: string, currentLast: string, first: string, last: string) => void;
}) {
    const [first, setFirst] = useState(firstName);
    const [last, setLast] = useState(lastName);

    useEffect(() => {
        setFirst(firstName);
        setLast(lastName);
    }, [firstName, lastName]);

    const commit = () => onCommit(accountId, firstName, lastName, first, last);

    return (
        <div className="flex items-center gap-2 min-w-[12rem]">
            <Input
                type="text"
                placeholder="First"
                className="w-28"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                }}
            />
            <Input
                type="text"
                placeholder="Last"
                className="w-28"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                }}
            />
        </div>
    );
}

function GradYearInput({
    accountId,
    gradYear,
    onCommit
}: {
    accountId: string;
    gradYear: number | null;
    onCommit: (id: string, value: string) => void;
}) {
    const [value, setValue] = useState(gradYear != null ? String(gradYear) : "");

    useEffect(() => {
        setValue(gradYear != null ? String(gradYear) : "");
    }, [gradYear]);

    return (
        <Input
            type="number"
            inputMode="numeric"
            placeholder="Year"
            className="w-20"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => {
                const next = value.trim();
                const current = gradYear != null ? String(gradYear) : "";
                if (next === current) return;
                if (next !== "" && (next.length !== 4 || !Number.isFinite(Number.parseInt(next, 10)))) {
                    toast.error("Enter a 4-digit year");
                    setValue(current);
                    return;
                }
                onCommit(accountId, value);
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.currentTarget.blur();
                }
            }}
        />
    );
}

function CommaListInput({
    accountId,
    items,
    placeholder,
    onCommit
}: {
    accountId: string;
    items: string[];
    placeholder: string;
    onCommit: (id: string, currentItems: string[], value: string) => void;
}) {
    const display = items.join(", ");
    const [value, setValue] = useState(display);

    useEffect(() => {
        setValue(display);
    }, [display]);

    return (
        <Input
            type="text"
            placeholder={placeholder}
            className="min-w-[10rem]"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => onCommit(accountId, items, value)}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.currentTarget.blur();
                }
            }}
        />
    );
}

function PhotoPicker({
    accountId,
    name,
    headshotUrl,
    disabled,
    onPick
}: {
    accountId: string;
    name: string;
    headshotUrl: string | null;
    disabled: boolean;
    onPick: (id: string, file: File) => void;
}) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [headshotUrl]);

    return (
        <div>
            <button
                type="button"
                className="relative h-10 w-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                aria-label={`Change photo for ${name}`}
            >
                {headshotUrl && !imageError ? (
                    <Image
                        src={headshotUrl}
                        alt={name}
                        width={40}
                        height={40}
                        className="h-10 w-10 object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <span className="flex h-full w-full items-center justify-center">
                        <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </span>
                )}
            </button>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={disabled}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!file.type.startsWith("image/")) {
                        toast.error("Please upload an image file.");
                        e.target.value = "";
                        return;
                    }
                    onPick(accountId, file);
                    e.target.value = "";
                }}
            />
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
