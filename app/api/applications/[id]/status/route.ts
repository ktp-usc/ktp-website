import { prisma } from '@/lib/prisma';
import { requireExec } from '@/lib/auth/guards';
import { badRequest, ok, serverError } from '@/lib/http/responses';
import { isValidStatus } from '@/lib/applications/status';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
    const authed = await requireExec();
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
