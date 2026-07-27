import { NextResponse } from 'next/server';
import { authServer } from '@/lib/auth/server';
import { getDevAuthBypassUser, isDevAuthBypassEnabled } from '@/lib/auth/dev-bypass';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    if (isDevAuthBypassEnabled()) {
        return NextResponse.json(
            { user: getDevAuthBypassUser() },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
                }
            }
        );
    }

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
