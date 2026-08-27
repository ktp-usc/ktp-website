import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authServer } from '@/lib/auth/server';
import { leaderType as LeaderType } from "@prisma/client";
import { canAccessFeature, canAccessRushees, hasExecAccess, type AuthzFeature } from '@/lib/auth/roles';

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

    const isAdmin =
        hasExecAccess(account?.type) ||
        (account?.leaderType != null && account.leaderType !== LeaderType.N_A);

    if (!isAdmin) {
        return { response: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
    }

    return authed;
}

export async function requireExec(): Promise<
    { user: AuthedUser } | { response: NextResponse }
> {
    const authed = await requireUser();
    if ('response' in authed) return authed;

    const account = await prisma.accounts.findUnique({
        where: { id: authed.user.id },
        select: { type: true }
    });

    if (!hasExecAccess(account?.type)) {
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

    if (!account || !canAccessRushees(account.type)) {
        return { response: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
    }

    return { user: authed.user, account };
}

export async function requireFeature(feature: AuthzFeature): Promise<
    { user: AuthedUser; type: string | null } | { response: NextResponse }
> {
    const authed = await requireUser();
    if ('response' in authed) return authed;

    const account = await prisma.accounts.findUnique({
        where: { id: authed.user.id },
        select: { type: true }
    });

    if (!canAccessFeature(feature, account?.type)) {
        return { response: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
    }

    return { user: authed.user, type: account?.type ?? null };
}
