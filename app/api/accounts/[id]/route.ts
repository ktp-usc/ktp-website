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

        if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

        return NextResponse.json({ data: account });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
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

        const body = (await req.json()) as {
            firstName?: string;
            lastName?: string;
            phoneNum?: string | null;
            majors?: string[];
            minors?: string[];
            gradYear?: number | null;
            linkedin?: string | null;
            github?: string | null;
            hometown?: string | null;
        };

        const updated = await prisma.accounts.update({
            where: { id: currentUserId },
            data: {
                ...(body.firstName != null ? { firstName: body.firstName } : {}),
                ...(body.lastName != null ? { lastName: body.lastName } : {}),
                ...(body.phoneNum !== undefined ? { phoneNum: body.phoneNum } : {}),
                ...(body.majors != null ? { majors: body.majors } : {}),
                ...(body.minors != null ? { minors: body.minors } : {}),
                ...(body.gradYear !== undefined ? { gradYear: body.gradYear } : {}),
                ...(body.linkedin !== undefined ? { linkedin: body.linkedin } : {}),
                ...(body.github !== undefined ? { github: body.github } : {}),
                ...(body.hometown !== undefined ? { hometown: body.hometown } : {})
            }
        });

        return NextResponse.json({ data: updated });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
