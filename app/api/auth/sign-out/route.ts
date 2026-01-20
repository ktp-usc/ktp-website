import { NextResponse } from 'next/server';
import { authServer } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
    await authServer.signOut(); // clears cookie via Set-Cookie
    return NextResponse.redirect(new URL('/', req.url));
}

// optional: keep POST too if you use fetch elsewhere
export async function POST(req: Request) {
    await authServer.signOut();
    return NextResponse.redirect(new URL('/', req.url));
}
