import { NextResponse } from 'next/server';
import { neonAuth } from '@neondatabase/auth/next/server';
import { prisma } from "@/lib/prisma";

// Members (brothers, exec/leadership, alumni) and rushees (PNMs) can see the
// chapter calendar. Applicants who haven't received a bid yet, and anyone
// signed out, cannot.
const CALENDAR_ALLOWED_TYPES = new Set(['BROTHER', 'LEADERSHIP', 'ALUMNI', 'PNM']);

export async function GET() {
    // 1) must be signed in
    const { session, user } = await neonAuth();
    if (!session || !user) {
        return NextResponse.json({ allowed: false, reason: 'unauthenticated' }, { status: 401 });
    }

    // 2) look up the app-level account row
    const account = await prisma.accounts.findUnique({
        where: { id: user.id },
        select: { type: true }
    });

    // 3) enforce member-or-rushee only
    const isAllowed = Boolean(account?.type) && CALENDAR_ALLOWED_TYPES.has(account!.type as string);
    if (!isAllowed) {
        return NextResponse.json({ allowed: false, reason: 'forbidden' }, { status: 403 });
    }

    return NextResponse.json({ allowed: true }, { status: 200 });
}
