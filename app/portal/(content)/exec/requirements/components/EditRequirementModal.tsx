import { X } from "lucide-react";
import type { PointRequirement } from "@prisma/client";
import { useState } from "react";
import { nextSemesters, memberType } from "@/data/requirementOptions";
import { ChevronUp, ChevronDown } from "lucide-react";
import { usePointRequirements } from "@/hooks/usePointRequirements";

type EditRequirementModalProps = {
  req: PointRequirement;
  onClose: () => void;
  onUpdate: (updatedRequirement: PointRequirement, id: string) => void;
};

export function EditRequirementModal({
  req,
  onClose,
  onUpdate,
}: EditRequirementModalProps) {
  const [semesterDropdown, setSemesterDropdown] = useState(false);
  const [memberDropdown, setMemberDropdown] = useState(false);

  const [requirementDetails, setRequirementDetails] = useState({
    memberType: req.memberType ?? "ALL_MEMBERS",
    name: req.name ?? "",
    semester: req.semester ?? nextSemesters[0],
    description: req.description ?? "",
    requiredAmount: req.requiredAmount ?? 0,
    pointsPerCompletion: req.pointsPerCompletion ?? 0,
    maxPoints: req.maxPoints ?? 0,
    id: req.id,
  });

  function handleChange(name: string, value: any) {
    setRequirementDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit() {
    onUpdate(requirementDetails, req.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg"
      >
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl font-semibold">Edit Requirement</h1>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-700"
          >
            <X />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <p className="mb-1 font-semibold">Name</p>
            <input
              type="text"
              value={requirementDetails.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full rounded-xl border p-3 text-lg outline-none focus:border-blue-600"
            />
          </label>

          <label className="block">
            <p className="mb-1 font-semibold">Description</p>
            <textarea
              value={requirementDetails.description ?? ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="min-h-28 w-full rounded-xl border p-3 text-lg outline-none focus:border-blue-600"
            />
          </label>

          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <div className="block">
              <p className="mb-1 font-semibold">Semester</p>
              <button
                onClick={() => setSemesterDropdown(!semesterDropdown)}
                type="button"
                className="w-full flex items-center cursor-pointer justify-between rounded-xl border p-3 outline-none focus:border-blue-600"
              >
                {requirementDetails.semester}
                {semesterDropdown ? <ChevronUp /> : <ChevronDown />}
              </button>
              {semesterDropdown && (
                <div className="flex flex-col p-1  border rounded-xl">
                  {nextSemesters.map((semester) => (
                    <button
                      type="button"
                      className={`text-left p-2 rounded-xl cursor-pointer no-raise ${semester === requirementDetails.semester ? "bg-blue-600 text-white" : "hover:bg-blue-200"}`}
                      onClick={() => {
                        handleChange("semester", semester);
                        setSemesterDropdown(false);
                      }}
                      key={semester}
                    >
                      {semester}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="block">
              <p className="mb-1 font-semibold">Member</p>
              <button
                onClick={() => setMemberDropdown(!memberDropdown)}
                type="button"
                className="w-full flex items-center cursor-pointer justify-between rounded-xl border p-3 outline-none focus:border-blue-600"
              >
                {requirementDetails.memberType}
                {memberDropdown ? <ChevronUp /> : <ChevronDown />}
              </button>
              {memberDropdown && (
                <div className="flex flex-col p-1  border rounded-xl">
                  {memberType.map((member) => (
                    <button
                      type="button"
                      className={`text-left p-2 rounded-xl cursor-pointer no-raise ${member === requirementDetails.memberType ? "bg-blue-600 text-white" : "hover:bg-blue-200"}`}
                      onClick={() => {
                        handleChange("memberType", member);
                        setMemberDropdown(false);
                      }}
                      key={member}
                    >
                      {member}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <label className="block">
              <p className="mb-1 font-semibold">Required</p>
              <input
                type="number"
                value={requirementDetails.requiredAmount}
                onChange={(e) =>
                  handleChange("requiredAmount", Number(e.target.value))
                }
                className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
              />
            </label>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border px-5 py-2 font-semibold"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="cursor-pointer rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
