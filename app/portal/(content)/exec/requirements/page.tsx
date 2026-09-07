"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ClipboardList, Plus, Search, Users } from "lucide-react";
import type { memberType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { nextSemesters } from "@/data/requirementOptions";
import { usePointRequirements } from "@/hooks/usePointRequirements";

import { Requirement } from "./components/requirement";
import {
  RequirementFormModal,
  type RequirementFormValues,
} from "./components/RequirementFormModal";
import { memberTypeLabel } from "./components/requirementLabels";

type MemberFilter = "ALL" | memberType;
type SemesterFilter = "ALL" | string;

const MEMBER_FILTERS: MemberFilter[] = ["ALL", "ALL_MEMBERS", "ACTIVE", "PNM"];

export default function Page() {
  const {
    createPointRequirement,
    updatePointRequirement,
    deletePointRequirement,
    requirements,
    loading,
  } = usePointRequirements();

  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [memberFilter, setMemberFilter] = useState<MemberFilter>("ALL");
  const [semesterFilter, setSemesterFilter] = useState<SemesterFilter>("ALL");

  const counts = useMemo(() => {
    return {
      total: requirements.length,
      currentSemester: requirements.filter(
        (req) => req.semester === nextSemesters[0],
      ).length,
      active: requirements.filter((req) => req.memberType === "ACTIVE").length,
      pnm: requirements.filter((req) => req.memberType === "PNM").length,
    };
  }, [requirements]);

  const visibleRequirements = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return requirements
      .filter((req) =>
        memberFilter === "ALL" ? true : req.memberType === memberFilter,
      )
      .filter((req) =>
        semesterFilter === "ALL" ? true : req.semester === semesterFilter,
      )
      .filter((req) => {
        if (!needle) return true;
        return (
          req.name.toLowerCase().includes(needle) ||
          req.description.toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [requirements, memberFilter, semesterFilter, query]);

  function handleCreate(values: RequirementFormValues) {
    createPointRequirement(values);
    setCreateOpen(false);
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl bg-transparent px-3 py-6 transition-colors duration-300 sm:px-4 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 transition-colors duration-300 sm:text-4xl dark:text-white">
            Requirements
          </h1>
          <p className="text-sm text-gray-600 transition-colors duration-300 sm:text-base dark:text-gray-400">
            Create and manage semester point requirements for actives, PNMs, and
            the full chapter.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="cursor-pointer self-start bg-blue-800 hover:bg-blue-900 sm:self-auto"
        >
          <Plus />
          Create requirement
        </Button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<ClipboardList className="h-4 w-4" />}
          label="Total"
          value={loading ? "—" : String(counts.total)}
        />
        <StatCard
          icon={<ClipboardList className="h-4 w-4" />}
          label={nextSemesters[0]}
          value={loading ? "—" : String(counts.currentSemester)}
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Active / PNM"
          value={loading ? "—" : `${counts.active} / ${counts.pnm}`}
        />
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {MEMBER_FILTERS.map((filter) => (
            <Button
              key={filter}
              size="sm"
              variant={memberFilter === filter ? "default" : "outline"}
              onClick={() => setMemberFilter(filter)}
              className={`cursor-pointer ${
                memberFilter === filter
                  ? ""
                  : "text-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
              }`}
            >
              {filter === "ALL" ? "All types" : memberTypeLabel(filter)}
            </Button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={semesterFilter}
            onValueChange={(value) => setSemesterFilter(value as SemesterFilter)}
          >
            <SelectTrigger className="w-full bg-white sm:w-44 dark:bg-gray-900">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All semesters</SelectItem>
              {nextSemesters.map((semester) => (
                <SelectItem key={semester} value={semester}>
                  {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search requirements"
              className="bg-white pl-9 dark:bg-gray-900"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : visibleRequirements.length === 0 ? (
        <Card className="border-dashed border-gray-300 bg-white/70 dark:border-gray-700 dark:bg-gray-900/60">
          <CardContent className="flex flex-col items-center px-6 py-14 text-center">
            <div className="mb-3 rounded-lg bg-blue-100 p-3 text-blue-700 dark:bg-gray-800 dark:text-blue-300">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              No requirements found
            </h2>
            <p className="mt-1 max-w-md text-sm text-gray-600 dark:text-gray-400">
              {requirements.length === 0
                ? "Create the first point requirement to start tracking member progress."
                : "Try a different type, semester, or search."}
            </p>
            {requirements.length === 0 ? (
              <Button
                className="mt-4 cursor-pointer bg-blue-800 hover:bg-blue-900"
                onClick={() => setCreateOpen(true)}
              >
                <Plus />
                Create requirement
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleRequirements.map((requirement) => (
            <Requirement
              key={requirement.id}
              req={requirement}
              onUpdate={updatePointRequirement}
              onDelete={deletePointRequirement}
            />
          ))}
        </div>
      )}

      <RequirementFormModal
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-md bg-blue-100 p-2 text-blue-700 dark:bg-gray-800 dark:text-blue-300">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
