import type { event, memberType, type as AccountType } from "@prisma/client";

export type EventFormData = {
  PointRequirement: string;
  name: string;
  description: string;
  startDate: string;
  location: string;
  activesOnly: boolean;
  pledgesOnly: boolean;
};

export type EventAudienceFlags = {
  activesOnly: boolean;
  pledgesOnly: boolean;
};

export type EventFormErrors = Partial<
  Record<"name" | "PointRequirement" | "startDate" | "location", string>
>;

export function getEventFormErrors(data: EventFormData): EventFormErrors {
  const errors: EventFormErrors = {};
  if (!data.name.trim()) errors.name = "Event name is required.";
  if (!data.PointRequirement.trim()) {
    errors.PointRequirement = "Point requirement is required.";
  }
  if (!data.startDate) errors.startDate = "Date and time are required.";
  if (!data.location.trim()) errors.location = "Location is required.";
  return errors;
}

export function toDateTimeLocalValue(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function eventToFormData(eventRecord: event): EventFormData {
  return {
    PointRequirement: eventRecord.PointRequirement ?? "",
    name: eventRecord.name ?? "",
    description: eventRecord.description ?? "",
    startDate: toDateTimeLocalValue(eventRecord.startDate),
    location: eventRecord.location ?? "",
    activesOnly: Boolean(eventRecord.activesOnly),
    pledgesOnly: Boolean(eventRecord.pledgesOnly),
  };
}

export const emptyEventFormData: EventFormData = {
  PointRequirement: "",
  name: "",
  description: "",
  startDate: "",
  location: "",
  activesOnly: false,
  pledgesOnly: false,
};

export function parseEventFormBody(body: unknown): EventFormData {
  const data = (body ?? {}) as Record<string, unknown>;
  return {
    PointRequirement: String(data.PointRequirement ?? ""),
    name: String(data.name ?? ""),
    description: String(data.description ?? ""),
    startDate: String(data.startDate ?? ""),
    location: String(data.location ?? ""),
    activesOnly: Boolean(data.activesOnly),
    pledgesOnly: Boolean(data.pledgesOnly),
  };
}

export function normalizeEventAudience(
  data: EventAudienceFlags,
): EventAudienceFlags {
  if (data.pledgesOnly) return { activesOnly: false, pledgesOnly: true };
  if (data.activesOnly) return { activesOnly: true, pledgesOnly: false };
  return { activesOnly: false, pledgesOnly: false };
}

export function toEventWriteData(data: EventFormData) {
  return {
    PointRequirement: data.PointRequirement.trim(),
    name: data.name.trim(),
    description: data.description.trim(),
    startDate: new Date(data.startDate),
    location: data.location.trim(),
    ...normalizeEventAudience(data),
  };
}

export function generateAttendanceCode(length = 6) {
  return crypto.randomUUID().replace(/-/g, "").slice(0, length).toUpperCase();
}

export const ACTIVE_EVENT_ACCOUNT_TYPES: AccountType[] = [
  "BROTHER",
  "CHAIR",
  "LEADERSHIP",
];

export const ALL_MEMBERS_EVENT_ACCOUNT_TYPES: AccountType[] = [
  "BROTHER",
  "CHAIR",
  "LEADERSHIP",
  "PNM",
];

export const PLEDGE_EVENT_ACCOUNT_TYPES: AccountType[] = ["PNM"];

export function attendanceAccountTypes({
  activesOnly,
  pledgesOnly,
}: EventAudienceFlags): AccountType[] {
  if (pledgesOnly) return PLEDGE_EVENT_ACCOUNT_TYPES;
  if (activesOnly) return ACTIVE_EVENT_ACCOUNT_TYPES;
  return ALL_MEMBERS_EVENT_ACCOUNT_TYPES;
}

export function accountTypesForRequirement(
  requirementMemberType: memberType,
): AccountType[] {
  if (requirementMemberType === "ACTIVE") return ACTIVE_EVENT_ACCOUNT_TYPES;
  if (requirementMemberType === "PNM") return PLEDGE_EVENT_ACCOUNT_TYPES;
  return ALL_MEMBERS_EVENT_ACCOUNT_TYPES;
}

export function isEligibleForEventAttendance(
  accountType: AccountType | null | undefined,
  flags: EventAudienceFlags,
): boolean {
  if (!accountType) return false;
  return attendanceAccountTypes(flags).includes(accountType);
}

export function eventAudienceLabel(flags: EventAudienceFlags) {
  if (flags.pledgesOnly) return "Pledges Only";
  if (flags.activesOnly) return "Actives Only";
  return "All Members";
}

const ACCOUNT_TYPES: AccountType[] = [
  "APPLICANT",
  "PNM",
  "BROTHER",
  "LEADERSHIP",
  "ALUMNI",
  "CHAIR",
];

export function parseAccountTypesParam(value: string): AccountType[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is AccountType =>
      ACCOUNT_TYPES.includes(item as AccountType),
    );
}
