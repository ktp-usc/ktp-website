import { NextRequest, NextResponse } from "next/server";
import { neonAuth } from "@neondatabase/auth/next/server";
import { prisma } from "@/lib/prisma";
import { canAccessFeature, isAuthzFeature } from "@/lib/auth/roles";

export async function GET(req: NextRequest) {
  const feature = req.nextUrl.searchParams.get("feature");
  if (!isAuthzFeature(feature)) {
    return NextResponse.json(
      { allowed: false, reason: "unknown_feature" },
      { status: 400 },
    );
  }

  const { session, user } = await neonAuth();
  if (!session || !user) {
    return NextResponse.json(
      { allowed: false, reason: "unauthenticated" },
      { status: 401 },
    );
  }

  const account = await prisma.accounts.findUnique({
    where: { id: user.id },
    select: { type: true },
  });

  if (!canAccessFeature(feature, account?.type)) {
    return NextResponse.json(
      { allowed: false, reason: "forbidden" },
      { status: 403 },
    );
  }

  return NextResponse.json({ allowed: true }, { status: 200 });
}
