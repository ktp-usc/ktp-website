import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { badRequest, ok, serverError } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
    const authed = await requireAdmin();
    if ('response' in authed) return authed.response;

    const { id } = await ctx.params;

    try {
        const app = await prisma.applications.findUnique({
            where: { id },
            include: { comments: { orderBy: { createdAt: 'desc' } } }
        });

        if (!app) return badRequest('application_not_found');
        return ok(app);
    } catch (e) {
        console.error(e);
        return serverError();
    }
}

export async function PATCH(req: Request, ctx: Ctx) {
    const authed = await requireAdmin();
    if ('response' in authed) return authed.response;

    const { id } = await ctx.params;

    try {
        const body = await req.json();

        const updated = await prisma.applications.update({
            where: { id },
            data: {
                fullName: body.fullName ?? undefined,
                email: body.email ?? undefined,
                classification: body.classification ?? undefined,
                major: body.major ?? undefined,
                minor: body.minor ?? undefined,
                resumeUrl: body.resumeUrl ?? undefined,
                eventsAttended: body.eventsAttended ?? undefined,
                reason: body.reason ?? undefined,
                isFlagged: body.isFlagged ?? undefined,
                submittedAt: body.submittedAt ?? undefined,
                status: body.status ?? undefined,
                gpa: body.gpa ?? undefined
            }
        });

        return ok(updated);
    } catch (e) {
        console.error(e);
        return serverError();
    }
}

export async function DELETE(_: Request, ctx: Ctx) {
    const authed = await requireAdmin();
    if ('response' in authed) return authed.response;

    const { id } = await ctx.params;

    try {
        await prisma.applications.delete({ where: { id } });
        return ok({ ok: true });
    } catch (e) {
        console.error(e);
        return serverError();
    }
}
