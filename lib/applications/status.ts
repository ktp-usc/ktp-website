import { applicationStatus } from "@prisma/client";

export function isValidStatus(v: unknown): v is applicationStatus {
  return (
    typeof v === "string" &&
    (Object.values(applicationStatus) as string[]).includes(v)
  );
}

/** Matches exec list UI codes: WAITLIST highest, CLOSED lowest. */
export const STATUS_SORT_RANK: Record<applicationStatus, number> = {
  CLOSED: 0,
  BID_DECLINED: 1,
  UNDER_REVIEW: 2,
  INTERVIEW: 3,
  BID_OFFERED: 4,
  BID_ACCEPTED: 5,
  INCOMPLETE: 6,
  WAITLIST: 7,
};

export function statusSortRank(status: applicationStatus): number {
  return STATUS_SORT_RANK[status] ?? 0;
}

export function lastNameFromFullName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return (parts[parts.length - 1] ?? "").toLowerCase();
}
