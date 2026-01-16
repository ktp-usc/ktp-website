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
        const account = await prisma.accounts.findUnique({ where: { id } });
        if (!account) return badRequest('account_not_found');
        return ok(account);
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

        const updated = await prisma.accounts.update({
            where: { id },
            data: {
                firstName: body.firstName ?? undefined,
                lastName: body.lastName ?? undefined,
                majors: body.majors ?? undefined,
                minors: body.minors ?? undefined,
                type: body.type ?? undefined,
                schoolEmail: body.schoolEmail ?? undefined,
                personalEmail: body.personalEmail ?? undefined,
                gradSemester: body.gradSemester ?? undefined,
                headshotBlobURL: body.headshotBlobURL ?? undefined,
                resumeBlobURL: body.resumeBlobURL ?? undefined,
                leaderType: body.leaderType ?? undefined,
                phoneNum: body.phoneNum ?? undefined,
                isNew: body.isNew ?? undefined,
                gradYear: body.gradYear ?? undefined,
                pledgeClass: body.pledgeClass ?? undefined,
                hometown: body.hometown ?? undefined,
                linkedin: body.linkedin ?? undefined,
                github: body.github ?? undefined
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
        await prisma.accounts.delete({ where: { id } });
        return ok({ ok: true });
    } catch (e) {
        console.error(e);
        return serverError();
    }
}
