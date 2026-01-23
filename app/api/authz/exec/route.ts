import { NextResponse } from 'next/server';
import { neonAuth } from '@neondatabase/auth/next/server';
import { prisma } from "@/lib/prisma";

export async function GET() {
    // 1) must be signed in
    const { session, user } = await neonAuth();
    if (!session || !user) {
        return NextResponse.json({ allowed: false, reason: 'unauthenticated' }, { status: 401 });
    }

    // 2) look up your app-level account row
    // adjust lookup key to match your schema (id/email/etc)
    const account = await prisma.accounts.findUnique({
        where: { id: user.id }, // or { email: user.email! } depending on your schema
        select: { type: true }
    });

    // 3) enforce exec
    const isExec = account?.type === 'LEADERSHIP';
    if (!isExec) {
        return NextResponse.json({ allowed: false, reason: 'forbidden' }, { status: 403 });
    }

    return NextResponse.json({ allowed: true }, { status: 200 });
}