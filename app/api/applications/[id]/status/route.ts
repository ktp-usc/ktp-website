import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { applicationStatus } from '@prisma/client';
import { badRequest, ok, serverError } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Ctx = { params: Promise<{ id: string }> };

function isValidStatus(v: unknown): v is applicationStatus {
    return typeof v === 'string' && (Object.values(applicationStatus) as string[]).includes(v);
}

export async function POST(req: Request, ctx: Ctx) {
    const authed = await requireAdmin();
    if ('response' in authed) return authed.response;

    const { id } = await ctx.params;

    try {
        const body = await req.json();
        if (!isValidStatus(body.status)) return badRequest('invalid_status');

        const updated = await prisma.applications.update({
            where: { id },
            data: { status: body.status }
        });

        return ok(updated);
    } catch (e) {
        console.error(e);
        return serverError();
    }
}
