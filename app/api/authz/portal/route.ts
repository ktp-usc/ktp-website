import { NextResponse } from 'next/server';
import { neonAuth } from '@neondatabase/auth/next/server';
import { prisma } from '@/lib/prisma';
import { findApprovedEmployerByEmail } from '@/lib/auth/employers';

// Single lookup used by proxy.ts to decide portal access, so /portal/exec pages
// don't need one round trip for the employer check and another for the exec check.
export async function GET() {
    const { session, user } = await neonAuth();

    if (!session || !user) {
        return NextResponse.json(
            { authenticated: false, hasAccount: false, isExec: false, isEmployer: false },
            { status: 401 }
        );
    }

    const [account, employer] = await Promise.all([
        prisma.accounts.findUnique({
            where: { id: user.id },
            select: { type: true }
        }),
        findApprovedEmployerByEmail(user.email)
    ]);

    return NextResponse.json(
        {
            authenticated: true,
            hasAccount: Boolean(account),
            isExec: account?.type === 'LEADERSHIP',
            isEmployer: Boolean(employer)
        },
        { status: 200 }
    );
}
