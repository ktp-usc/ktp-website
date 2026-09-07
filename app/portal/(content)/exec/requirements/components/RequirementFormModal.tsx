"use client";

import { useEffect, useState } from "react";
import type { memberType, PointRequirement } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { memberType as memberTypeOptions, nextSemesters } from "@/data/requirementOptions";

import { memberTypeLabel } from "./requirementLabels";

export type RequirementFormValues = {
  memberType: memberType;
  name: string;
  semester: string;
  description: string;
  requiredAmount: number;
  pointsPerCompletion: number;
  maxPoints: number;
};

const EMPTY_FORM: RequirementFormValues = {
  memberType: "ALL_MEMBERS",
  name: "",
  semester: nextSemesters[0],
  description: "",
  requiredAmount: 0,
  pointsPerCompletion: 0,
  maxPoints: 0,
};

function fromRequirement(req: PointRequirement): RequirementFormValues {
  return {
    memberType: req.memberType,
    name: req.name,
    semester: req.semester,
    description: req.description ?? "",
    requiredAmount: req.requiredAmount,
    pointsPerCompletion: req.pointsPerCompletion,
    maxPoints: req.maxPoints,
  };
}

type RequirementFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initial?: PointRequirement;
  onClose: () => void;
  onSubmit: (values: RequirementFormValues) => void;
};

export function RequirementFormModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: RequirementFormModalProps) {
  const [values, setValues] = useState<RequirementFormValues>(
    initial ? fromRequirement(initial) : EMPTY_FORM,
  );

  useEffect(() => {
    if (!open) return;
    setValues(initial ? fromRequirement(initial) : EMPTY_FORM);
  }, [open, initial]);

  function setField<K extends keyof RequirementFormValues>(
    key: K,
    value: RequirementFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim()) return;
    onSubmit({
      ...values,
      name: values.name.trim(),
      description: values.description.trim(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create requirement" : "Edit requirement"}
            </DialogTitle>
            <DialogDescription>
              Set who this applies to, what members need to complete, and how
              points are awarded.
            </DialogDescription>
          </DialogHeader>

          <section className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Scope
              </p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Who this applies to and which semester it counts toward.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="requirement-semester">Semester</Label>
                <Select
                  value={values.semester}
                  onValueChange={(value) => setField("semester", value)}
                >
                  <SelectTrigger id="requirement-semester" className="w-full bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {nextSemesters.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirement-member-type">Member type</Label>
                <Select
                  value={values.memberType}
                  onValueChange={(value) =>
                    setField("memberType", value as memberType)
                  }
                >
                  <SelectTrigger
                    id="requirement-member-type"
                    className="w-full bg-white dark:bg-gray-900"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {memberTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {memberTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-gray-200 pt-5 dark:border-gray-700">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Requirement
              </p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                The activity members need to complete.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirement-name">Name</Label>
              <Input
                id="requirement-name"
                value={values.name}
                placeholder="e.g. Coffee Chats"
                onChange={(e) => setField("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirement-description">Description</Label>
              <Textarea
                id="requirement-description"
                value={values.description}
                placeholder="e.g. Pledges must complete 10 coffee chats by the end of the semester"
                className="min-h-24"
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>
          </section>

          <section className="space-y-4 border-t border-gray-200 pt-5 dark:border-gray-700">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Points
              </p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                How completion contributes to the semester total.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="requirement-required">Required count</Label>
                <Input
                  id="requirement-required"
                  type="number"
                  min={0}
                  value={values.requiredAmount}
                  onChange={(e) =>
                    setField("requiredAmount", Number(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirement-ppc">Points per completion</Label>
                <Input
                  id="requirement-ppc"
                  type="number"
                  min={0}
                  value={values.pointsPerCompletion}
                  onChange={(e) =>
                    setField("pointsPerCompletion", Number(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirement-max">Maximum points</Label>
                <Input
                  id="requirement-max"
                  type="number"
                  min={0}
                  value={values.maxPoints}
                  onChange={(e) =>
                    setField("maxPoints", Number(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!values.name.trim()}>
              {mode === "create" ? "Create requirement" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
