import { NextRequest, NextResponse } from "next/server";
import { neonAuthMiddleware } from "@neondatabase/auth/next/server";
import { featureForPath } from "@/lib/auth/portalPaths";

const requireAuth = neonAuthMiddleware({
  loginUrl: "/auth/sign-in",
});

export default async function middleware(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult && authResult.status !== 200) {
    return authResult;
  }

  const pathname = req.nextUrl.pathname;
  const feature = featureForPath(pathname);

  if (!feature) {
    return NextResponse.next();
  }

  const checkUrl = new URL("/api/authz/feature", req.nextUrl.origin);
  checkUrl.searchParams.set("feature", feature);
  const res = await fetch(checkUrl, {
    headers: {
      cookie: req.headers.get("cookie") ?? "",
    },
  });

  if (res.ok) {
    return NextResponse.next();
  }

  const redirect = new URL(
    pathname.startsWith("/portal") ? "/portal" : "/",
    req.nextUrl.origin,
  );
  redirect.searchParams.set(
    "error",
    feature === "exec" || feature === "leadership"
      ? "exec_only"
      : feature === "calendar"
        ? "calendar_restricted"
        : "access_restricted",
  );
  return NextResponse.redirect(redirect);
}

export const config = {
  matcher: ["/portal", "/portal/:path*", "/calendar", "/calendar/:path*"],
};
