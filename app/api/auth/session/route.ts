import { NextResponse } from 'next/server';
import { authServer } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    const { data } = await authServer.getSession();

    return NextResponse.json(
        { user: data?.user ?? null },
        {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
            }
        }
    );
}
