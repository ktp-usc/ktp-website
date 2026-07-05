import { UUID } from "crypto";
import { Pencil, Trash2 } from "lucide-react";
import { EditRequirementModal } from "./EditRequirementModal";
import { useState } from "react";

import type { PointRequirement } from "@prisma/client";

type RequirementCardProps = {
  req: PointRequirement;
  onUpdate: (updatedRequirement: PointRequirement, id: string) => void;
  onDelete: (id: string) => void;
};

export function Requirement({ req, onUpdate, onDelete }: RequirementCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div className="p-4 bg-white  rounded-2xl m-8">
      <div className="flex justify-between">
        <h1 className="font-semibold text-2xl">{req.name}</h1>
        <div className="flex gap-4">
          <button
            className="text-blue-600 cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            <Pencil />
          </button>
          <button
            className="text-red-600 cursor-pointer"
            onClick={() => onDelete(req.id)}
          >
            <Trash2 />
          </button>
        </div>
      </div>
      <p className="text-xl pb-2">{req.description}</p>
      <div className="flex justify-between border-t pt-2">
        <div className="">
          <h2 className="font-semibold">SEMESTER</h2>
          <p>{req.semester}</p>
        </div>
        <div>
          <h2 className="font-semibold">MEMBERS</h2>
          <p>{req.memberType}</p>
        </div>
        <div>
          <h2 className="font-semibold">REQUIRED</h2>
          <p>{req.requiredAmount}</p>
        </div>
      </div>
      {isEditing && (
        <EditRequirementModal
          onUpdate={onUpdate}
          req={req}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
