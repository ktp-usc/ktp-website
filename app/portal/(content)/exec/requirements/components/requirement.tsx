"use client";

import { useState } from "react";
import { Calendar, Hash, Pencil, Trash2, Trophy, Users } from "lucide-react";
import type { PointRequirement } from "@prisma/client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { RequirementFormModal, type RequirementFormValues } from "./RequirementFormModal";
import { memberTypeBadgeClass, memberTypeLabel } from "./requirementLabels";

type RequirementCardProps = {
  req: PointRequirement;
  onUpdate: (updatedRequirement: RequirementFormValues, id: string) => void;
  onDelete: (id: string) => void;
};

export function Requirement({ req, onUpdate, onDelete }: RequirementCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <>
      <Card className="group border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {req.name}
              </h2>
              {req.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                  {req.description}
                </p>
              ) : null}
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${memberTypeBadgeClass(req.memberType)}`}
            >
              {memberTypeLabel(req.memberType)}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Meta icon={Calendar} label="Semester" value={req.semester} />
            <Meta icon={Hash} label="Required" value={String(req.requiredAmount)} />
            <Meta
              icon={Trophy}
              label="Per completion"
              value={`${req.pointsPerCompletion} pts`}
            />
            <Meta icon={Users} label="Max points" value={String(req.maxPoints)} />
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              <Pencil />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
              onClick={() => setIsDeleting(true)}
            >
              <Trash2 />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>


      {isEditing && (
        <RequirementFormModal
          open={isEditing}
          mode="edit"
          initial={req}
          onClose={() => setIsEditing(false)}
          onSubmit={(values) => {
            onUpdate(values, req.id);
            setIsEditing(false);
          }}
        />
      )}

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete requirement</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">{req.name}</span>.
              Members tracking this requirement will no longer see it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => onDelete(req.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-gray-800 dark:text-gray-300">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-gray-400">{label}</p>
        <p className="truncate font-medium text-gray-900 dark:text-gray-100">
          {value}
        </p>
      </div>
    </div>
  );
}
