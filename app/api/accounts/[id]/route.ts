// app/api/accounts/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authServer } from '@/lib/auth/server';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;

        const { data, error } = await authServer.getSession();
        const currentUserId = data?.user?.id ?? null;

        if (error || !data?.session || !currentUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (id !== currentUserId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const account = await prisma.accounts.findUnique({
            where: { id: currentUserId },
            include: { applications: true }
        });

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        return NextResponse.json({ data: account });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
