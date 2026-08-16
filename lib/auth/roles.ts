import type { type as AccountType } from "@prisma/client";

export function hasExecAccess(type: AccountType | string | null | undefined): boolean {
  return type === "LEADERSHIP" || type === "CHAIR";
}
