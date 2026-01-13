import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authServer } from '@/lib/auth/server';

export async function GET() {
    const { data } = await authServer.getSession();
    const userId = data?.user?.id ?? null;

    if (!userId) {
        return NextResponse.json({ account: null }, { status: 401 });
    }

    const account =
        (await prisma.accounts.findUnique({ where: { id: userId } })) ??
        (await prisma.accounts.create({
            data: {
                id: userId,
                majors: [],
                minors: [],
                schoolEmail: data?.user?.email ?? null
            }
        }));

    return NextResponse.json({ account });
}
