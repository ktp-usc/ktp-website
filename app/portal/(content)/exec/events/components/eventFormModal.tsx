"use client";
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import type { PointRequirement, event } from "@prisma/client";
import { usePointRequirements } from "@/hooks/usePointRequirements";
import {
  emptyEventFormData,
  eventToFormData,
  getEventFormErrors,
  type EventFormData,
  type EventFormErrors,
} from "@/lib/events";

type EventFormModalProps = {
  event?: event;
  onClose: () => void;
  onSubmit: (data: EventFormData) => void;
};

type PointRequirementPickerModalProps = {
  requirements: PointRequirement[];
  selected: string;
  onSelect: (name: string) => void;
  onClose: () => void;
};

function PointRequirementPickerModal({
  requirements,
  selected,
  onSelect,
  onClose,
}: PointRequirementPickerModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h2 className="text-xl font-semibold">Select Point Requirement</h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-700"
          >
            <X />
          </button>
        </div>
        <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
          {requirements.length === 0 && (
            <p className="p-2 text-gray-500">No point requirements found.</p>
          )}
          {requirements.map((requirement) => (
            <button
              type="button"
              key={requirement.id}
              onClick={() => onSelect(requirement.name)}
              className={`no-raise cursor-pointer rounded-xl p-3 text-left ${
                requirement.name === selected
                  ? "bg-blue-600 text-white"
                  : "hover:bg-blue-200"
              }`}
            >
              {requirement.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EventFormModal({
  event,
  onClose,
  onSubmit,
}: EventFormModalProps) {
  const isEditing = Boolean(event);

  const handleChange = (key: keyof EventFormData, value: unknown) => {
    setEventData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as keyof EventFormErrors];
      return next;
    });
  };

  function handleSubmit() {
    const nextErrors = getEventFormErrors(eventData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(eventData);
    onClose();
  }

  const [eventData, setEventData] = useState<EventFormData>(
    event ? eventToFormData(event) : emptyEventFormData,
  );
  const [errors, setErrors] = useState<EventFormErrors>({});
  const { requirements } = usePointRequirements();
  const [pointRequirementPickerOpen, setPointRequirementPickerOpen] =
    useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => onClose()}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {isEditing ? "Edit Attendance Event" : "Create Attendance Event"}
            </h1>
            <p className="mt-1 text-gray-500">Configure the event details</p>
          </div>
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
            <p className="mb-1 font-semibold">
              Event Name <span className="text-red-600">*</span>
            </p>
            <input
              className={`w-full rounded-xl border p-3 text-lg outline-none focus:border-blue-600 ${
                errors.name ? "border-red-500" : ""
              }`}
              value={eventData.name}
              name="name"
              placeholder="Weekly Chapter Meeting"
              onChange={(e) =>
                handleChange(e.target.name as keyof EventFormData, e.target.value)
              }
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </label>

          <div className="block">
            <p className="mb-1 font-semibold">
              Point Requirement <span className="text-red-600">*</span>
            </p>
            <button
              type="button"
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-3 outline-none focus:border-blue-600 ${
                errors.PointRequirement ? "border-red-500" : ""
              }`}
              onClick={() => setPointRequirementPickerOpen(true)}
            >
              {eventData.PointRequirement
                ? eventData.PointRequirement
                : "Select Point Requirement"}
              <ChevronDown />
            </button>
            {errors.PointRequirement && (
              <p className="mt-1 text-sm text-red-600">
                {errors.PointRequirement}
              </p>
            )}
          </div>

          <label className="block">
            <p className="mb-1 font-semibold">
              Event Date & Time <span className="text-red-600">*</span>
            </p>
            <input
              type="datetime-local"
              step={60}
              className={`w-full rounded-xl border p-3 outline-none focus:border-blue-600 ${
                errors.startDate ? "border-red-500" : ""
              }`}
              name="startDate"
              value={eventData.startDate}
              onChange={(e) =>
                handleChange(e.target.name as keyof EventFormData, e.target.value)
              }
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </label>

          <label className="block">
            <p className="mb-1 font-semibold">
              Location <span className="text-red-600">*</span>
            </p>
            <input
              className={`w-full rounded-xl border p-3 text-lg outline-none focus:border-blue-600 ${
                errors.location ? "border-red-500" : ""
              }`}
              value={eventData.location}
              name="location"
              placeholder="300 Main Room 200b"
              onChange={(e) =>
                handleChange(e.target.name as keyof EventFormData, e.target.value)
              }
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </label>

          <label className="block">
            <p className="mb-1 font-semibold">Description (Optional)</p>
            <textarea
              className="min-h-28 w-full rounded-xl border p-3 text-lg outline-none focus:border-blue-600"
              name="description"
              value={eventData.description}
              onChange={(e) =>
                handleChange(e.target.name as keyof EventFormData, e.target.value)
              }
            />
          </label>

          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-4">
              <p className="font-semibold">Actives Only</p>
              <button
                type="button"
                className={`flex cursor-pointer items-center rounded-full p-1 ${
                  eventData.activesOnly ? "bg-blue-800" : "bg-gray-200"
                }`}
                onClick={() => {
                  const next = !eventData.activesOnly;
                  handleChange("activesOnly", next);
                  if (next) handleChange("pledgesOnly", false);
                }}
              >
                <span
                  className={`rounded-full p-2 ${
                    !eventData.activesOnly ? "bg-white" : ""
                  }`}
                />
                <span
                  className={`rounded-full p-2 ${
                    eventData.activesOnly ? "bg-white" : ""
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-semibold">Pledges Only</p>
              <button
                type="button"
                className={`flex cursor-pointer items-center rounded-full p-1 ${
                  eventData.pledgesOnly ? "bg-blue-800" : "bg-gray-200"
                }`}
                onClick={() => {
                  const next = !eventData.pledgesOnly;
                  handleChange("pledgesOnly", next);
                  if (next) handleChange("activesOnly", false);
                }}
              >
                <span
                  className={`rounded-full p-2 ${
                    !eventData.pledgesOnly ? "bg-white" : ""
                  }`}
                />
                <span
                  className={`rounded-full p-2 ${
                    eventData.pledgesOnly ? "bg-white" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t pt-4">
          <button
            type="button"
            className="cursor-pointer rounded-xl border px-5 py-2 font-semibold"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white"
          >
            {isEditing ? "Save Changes" : "Create Event"}
          </button>
        </div>
      </form>

      {pointRequirementPickerOpen && (
        <PointRequirementPickerModal
          requirements={requirements}
          selected={eventData.PointRequirement}
          onSelect={(name) => {
            handleChange("PointRequirement", name);
            setPointRequirementPickerOpen(false);
          }}
          onClose={() => setPointRequirementPickerOpen(false)}
        />
      )}
    </div>
  );
}
