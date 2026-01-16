import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/guards';
import { ok, badRequest, serverError } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
    const authed = await requireUser();
    if ('response' in authed) return authed.response;

    try {
        const existing = await prisma.applications.findUnique({
            where: { userId: authed.user.id }
        });

        if (!existing) return badRequest('no_application_to_submit');

        const submitted = await prisma.applications.update({
            where: { userId: authed.user.id },
            data: {
                submittedAt: new Date(),
                status: 'UNDER_REVIEW'
            }
        });

        return ok(submitted);
    } catch (e) {
        console.error(e);
        return serverError();
    }
}
