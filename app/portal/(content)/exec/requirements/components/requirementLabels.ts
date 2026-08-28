import type { memberType } from "@prisma/client";

export function memberTypeLabel(type: memberType | string): string {
  switch (type) {
    case "ALL_MEMBERS":
      return "All Members";
    case "ACTIVE":
      return "Active";
    case "PNM":
      return "PNM";
    default:
      return String(type);
  }
}

export function memberTypeBadgeClass(type: memberType | string): string {
  switch (type) {
    case "PNM":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200";
  }
}
