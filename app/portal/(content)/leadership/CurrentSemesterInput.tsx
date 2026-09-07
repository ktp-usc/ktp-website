"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCurrentSemesterQuery,
  useUpdateCurrentSemesterMutation,
} from "@/client/hooks/semester";

export function CurrentSemesterInput() {
  const { data, isLoading } = useCurrentSemesterQuery();
  const updateSemester = useUpdateCurrentSemesterMutation();
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(data?.semester ?? "");
  }, [data?.semester]);

  async function save() {
    const next = value.trim().replace(/\s+/g, " ");
    if (!next || next === (data?.semester ?? "").trim()) return;

    try {
      await updateSemester.mutateAsync(next);
      toast.success(`Current semester set to ${next}.`);
    } catch {
      toast.error("Could not update the current semester.");
    }
  }

  return (
    <div className="w-full sm:max-w-xs">
      <Label
        htmlFor="current-semester"
        className="text-xs font-medium text-gray-500 dark:text-gray-400"
      >
        Current semester
      </Label>
      <Input
        id="current-semester"
        value={value}
        disabled={isLoading || updateSemester.isPending}
        placeholder="e.g. Fall 2026"
        className="mt-1 bg-white dark:bg-gray-900"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void save();
          }
        }}
      />
    </div>
  );
}
