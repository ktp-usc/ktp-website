"use client";

import { X } from "lucide-react";

type DeleteEventModalProps = {
  eventName: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteEventModal({
  eventName,
  onClose,
  onConfirm,
}: DeleteEventModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl font-semibold">Delete Event</h1>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-700"
          >
            <X />
          </button>
        </div>
        <p className="text-gray-600">
          This will permanently delete{" "}
          <span className="font-semibold text-slate-900">{eventName}</span> and
          its attendance records. This cannot be undone.
        </p>
        <div className="mt-8 flex justify-end gap-4 border-t pt-4">
          <button
            type="button"
            className="cursor-pointer rounded-xl border px-5 py-2 font-semibold"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-red-600 px-5 py-2 font-semibold text-white"
            onClick={onConfirm}
          >
            Delete Event
          </button>
        </div>
      </div>
    </div>
  );
}
