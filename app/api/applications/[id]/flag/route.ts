import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { badRequest, ok, serverError } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
    const authed = await requireAdmin();
    if ('response' in authed) return authed.response;

    const { id } = await ctx.params;

    try {
        const body = await req.json().catch(() => ({}));
        const provided = body.isFlagged;

        const current = await prisma.applications.findUnique({
            where: { id },
            select: { isFlagged: true }
        });

        if (!current) return badRequest('application_not_found');

        if (provided !== undefined && typeof provided !== 'boolean') {
            return badRequest('invalid_isFlagged');
        }

        const nextValue =
            typeof provided === 'boolean' ? provided : !(current.isFlagged ?? false);

        const updated = await prisma.applications.update({
            where: { id },
            data: { isFlagged: nextValue }
        });

        return ok(updated);
    } catch (e) {
        console.error(e);
        return serverError();
    }
}
