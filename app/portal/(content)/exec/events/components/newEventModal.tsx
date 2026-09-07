"use client";

import { EventFormModal } from "./eventFormModal";
import type { EventFormData } from "@/lib/events";

type NewEventModalProps = {
  onClose: () => void;
  createEvent: (data: EventFormData) => void;
};

export function NewEventModal({ onClose, createEvent }: NewEventModalProps) {
  return <EventFormModal onClose={onClose} onSubmit={createEvent} />;
}
