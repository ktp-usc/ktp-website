import { prisma } from '@/lib/prisma';
import { requireBrother } from '@/lib/auth/guards';
import { ok, serverError } from '@/lib/http/responses';
import { applicationStatus, type as AccountType } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    const authed = await requireBrother();
    if ('response' in authed) return authed.response;

    const commenter =
        [authed.account.firstName, authed.account.lastName].filter(Boolean).join(' ').trim() ||
        authed.account.id;

    try {
        const accounts = await prisma.accounts.findMany({
            where: {
                type: AccountType.APPLICANT
            },
            include: {
                applications: {
                    select: { id: true, fullName: true, status: true, userId: true }
                }
            },
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
        });

        const appIds = accounts
            .map((acct) => acct.applications?.id ?? null)
            .filter((id): id is string => Boolean(id));

        const myComments = appIds.length
            ? await prisma.comment.findMany({
                  where: { applicationId: { in: appIds }, commenter },
                  orderBy: { createdAt: 'desc' }
              })
            : [];

        const myCommentByApp = new Map(myComments.map((c) => [c.applicationId, c]));

        const items = accounts.map((acct) => {
            const app = acct.applications;
            const appId = app?.id ?? null;
            const myComment = appId ? myCommentByApp.get(appId) ?? null : null;
            const fullName =
                app?.fullName ??
                [acct.firstName, acct.lastName].filter(Boolean).join(' ').trim() ??
                'Unnamed Applicant';

            return {
                accountId: acct.id,
                applicationId: appId,
                fullName,
                status: app?.status ?? applicationStatus.INCOMPLETE,
                userId: app?.userId ?? acct.id,
                headshotUrl: acct.headshotBlobURL ?? null,
                myComment: myComment
                    ? { id: myComment.id, body: myComment.body ?? '', createdAt: myComment.createdAt }
                    : null
            };
        });

        return ok({ items, commenter });
    } catch (e) {
        console.error('GET /api/rushees error:', e);
        return serverError();
    }
}
