import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authServer } from '@/lib/auth/server';
import { leaderType as LeaderType } from "@prisma/client";

export type AuthedUser = {
    id: string; // neon auth user id (uuid)
};

export async function requireUser(): Promise<
    { user: AuthedUser } | { response: NextResponse }
> {
    const { data } = await authServer.getSession(); // adapt to your helper
    const user = data?.user;

    if (!user?.id) {
        return { response: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };
    }

    return { user: { id: user.id } };
}

export async function requireAdmin(): Promise<
    { user: AuthedUser } | { response: NextResponse }
> {
    const authed = await requireUser();
    if ('response' in authed) return authed;

    const account = await prisma.accounts.findUnique({
        where: { id: authed.user.id },
        select: { type: true, leaderType: true }
    });

    // pick the rule you want:
    const isAdmin =
        account?.type === 'LEADERSHIP' ||
        (account?.leaderType != null && account.leaderType !== LeaderType.N_A);

    if (!isAdmin) {
        return { response: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
    }

    return authed;
}

export async function requireBrother(): Promise<
    { user: AuthedUser; account: { id: string; firstName: string; lastName: string; type: string | null } } | { response: NextResponse }
> {
    const authed = await requireUser();
    if ('response' in authed) return authed;

    const account = await prisma.accounts.findUnique({
        where: { id: authed.user.id },
        select: { id: true, firstName: true, lastName: true, type: true }
    });

    if (!account || account.type !== 'BROTHER') {
        return { response: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
    }

    return { user: authed.user, account };
}
