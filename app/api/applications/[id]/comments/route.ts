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

        const statusOverride = body.statusOverride;
        if (statusOverride != null && !isValidStatus(statusOverride)) {
            return badRequest('invalid_status_override');
        }

        const result = await prisma.$transaction(async (tx) => {
            const comment = await tx.comment.create({
                data: {
                    applicationId: id,
                    commenter: body.commenter ?? null,
                    body: body.body ?? null,
                    statusOverride: statusOverride ?? null
                }
            });

            if (statusOverride) {
                await tx.applications.update({
                    where: { id },
                    data: { status: statusOverride }
                });
            }

            return comment;
        });

        return ok(result);
    } catch (e) {
        console.error(e);
        return serverError();
    }
}
