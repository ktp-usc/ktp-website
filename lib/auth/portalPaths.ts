export const AUTHZ_FEATURES = [
  "exec",
  "leadership",
  "active",
  "pledge",
  "calendar",
  "career",
  "voting",
  "active-points",
  "pledge-points",
  "rushees",
] as const;

export type AuthzFeature = (typeof AUTHZ_FEATURES)[number];

export function isAuthzFeature(
  value: string | null | undefined,
): value is AuthzFeature {
  return AUTHZ_FEATURES.includes(value as AuthzFeature);
}

export function featureForPath(pathname: string): AuthzFeature | null {
  if (
    pathname.startsWith("/portal/exec") ||
    pathname.startsWith("/portal/leadership")
  ) {
    return "exec";
  }
  if (pathname.startsWith("/portal/career-center")) return "career";
  if (pathname === "/portal/voting" || pathname.startsWith("/portal/voting/")) {
    return "voting";
  }
  if (pathname.startsWith("/portal/active-points")) return "active-points";
  if (pathname.startsWith("/portal/pledge-points")) return "pledge-points";
  if (pathname === "/portal/active" || pathname.startsWith("/portal/active/")) {
    return "active";
  }
  if (pathname === "/portal/pledge" || pathname.startsWith("/portal/pledge/")) {
    return "pledge";
  }
  if (pathname.startsWith("/portal/rushees")) return "rushees";
  if (
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/portal/calendar")
  ) {
    return "calendar";
  }
  return null;
}
