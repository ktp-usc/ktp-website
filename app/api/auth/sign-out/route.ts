import { NextResponse } from 'next/server';
import { authServer } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
    // let neon auth clear the cookie
    await authServer.signOut();

    // return a normal response so Set-Cookie is preserved
    const res = NextResponse.json({ ok: true }, { status: 200 });

    // prevent any caching
    res.headers.set('cache-control', 'no-store, max-age=0');

    return res;
}

// optional GET fallback
export async function GET() {
    await authServer.signOut();

    const res = NextResponse.json({ ok: true }, { status: 200 });
    res.headers.set('cache-control', 'no-store, max-age=0');

    return res;
}