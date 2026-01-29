import { prisma } from '@/lib/prisma';
import { requireBrother } from '@/lib/auth/guards';
import { ok, badRequest, serverError } from '@/lib/http/responses';
import { applicationStatus, type as AccountType } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
    const authed = await requireBrother();
    if ('response' in authed) return authed.response;

    const { id } = await ctx.params;
    const commenterName = [authed.account.firstName, authed.account.lastName].filter(Boolean).join(' ').trim();
    const commenter = commenterName || authed.account.id || authed.user.id;

    try {
        const body = await req.json().catch(() => null);
        const text = (body?.body ?? body?.text ?? body?.comment ?? '').toString().trim();
        if (!text) return badRequest('comment_required');

        const application = await prisma.applications.findFirst({
            where: {
                id,
                status: { not: applicationStatus.CLOSED },
                accounts: { is: { type: AccountType.APPLICANT } }
            },
            select: { id: true }
        });

        if (!application) return badRequest('invalid_application');

        const existing = await prisma.comment.findFirst({
            where: { applicationId: id, commenter },
            orderBy: { createdAt: 'desc' }
        });

        const comment = existing
            ? await prisma.comment.update({
                  where: { id: existing.id },
                  data: { body: text, commenter }
              })
            : await prisma.comment.create({
                  data: { applicationId: id, commenter, body: text }
              });

        return ok(comment);
    } catch (e) {
        console.error('POST /api/rushees/[id]/comment error:', e);
        return serverError();
    }
}
