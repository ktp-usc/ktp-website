import type { type as AccountType } from "@prisma/client";
import type { AuthzFeature } from "./portalPaths";

export type { AuthzFeature } from "./portalPaths";
export { AUTHZ_FEATURES, featureForPath, isAuthzFeature } from "./portalPaths";

export type AccountTypeLike = AccountType | string | null | undefined;

export type PortalRole = "exec" | "applicant" | "member" | "pnm";

export function hasExecAccess(type: AccountTypeLike): boolean {
  return type === "LEADERSHIP" || type === "CHAIR";
}

export function isBrotherOrAlumni(type: AccountTypeLike): boolean {
  return type === "BROTHER" || type === "ALUMNI";
}

export function toPortalRole(type: AccountTypeLike): PortalRole {
  if (hasExecAccess(type)) return "exec";
  if (isBrotherOrAlumni(type)) return "member";
  if (type === "PNM") return "pnm";
  return "applicant";
}

export function portalHomePath(type: AccountTypeLike): string {
  switch (toPortalRole(type)) {
    case "exec":
      return "/portal/leadership";
    case "member":
      return "/portal/active";
    case "pnm":
      return "/portal/pledge";
    default:
      return "/portal";
  }
}

export function canAccessCalendar(type: AccountTypeLike): boolean {
  return (
    type === "BROTHER" ||
    type === "LEADERSHIP" ||
    type === "CHAIR" ||
    type === "ALUMNI" ||
    type === "PNM"
  );
}

export function canAccessVoting(type: AccountTypeLike): boolean {
  return type === "PNM" || isBrotherOrAlumni(type) || hasExecAccess(type);
}

export function canAccessActivePoints(type: AccountTypeLike): boolean {
  return canAccessVoting(type);
}

export function canAccessCareerCenter(type: AccountTypeLike): boolean {
  return isBrotherOrAlumni(type) || hasExecAccess(type);
}

export function canAccessPledgePoints(type: AccountTypeLike): boolean {
  return type === "PNM" || hasExecAccess(type);
}

export function canAccessLeadershipDashboard(type: AccountTypeLike): boolean {
  return hasExecAccess(type);
}

export function canAccessActiveDashboard(type: AccountTypeLike): boolean {
  return isBrotherOrAlumni(type) || hasExecAccess(type);
}

export function canAccessPledgeDashboard(type: AccountTypeLike): boolean {
  return type === "PNM" || hasExecAccess(type);
}

export function canAccessRushees(type: AccountTypeLike): boolean {
  return canAccessActiveDashboard(type);
}

export function canAccessFeature(
  feature: AuthzFeature,
  type: AccountTypeLike,
): boolean {
  switch (feature) {
    case "exec":
    case "leadership":
      return hasExecAccess(type);
    case "active":
      return canAccessActiveDashboard(type);
    case "pledge":
      return canAccessPledgeDashboard(type);
    case "calendar":
      return canAccessCalendar(type);
    case "career":
      return canAccessCareerCenter(type);
    case "voting":
      return canAccessVoting(type);
    case "active-points":
      return canAccessActivePoints(type);
    case "pledge-points":
      return canAccessPledgePoints(type);
    case "rushees":
      return canAccessRushees(type);
  }
}
