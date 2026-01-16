import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { badRequest, ok, serverError } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isUuidLike(value: string) {
    return /^[0-9a-fA-F-]{36}$/.test(value);
}

export async function GET(req: Request) {
    const authed = await requireAdmin();
    if ('response' in authed) return authed.response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return badRequest('missing_id');
    if (!isUuidLike(id)) return badRequest('invalid_id');

    try {
        const ordered = await prisma.applications.findMany({
            select: { id: true },
            orderBy: [{ isFlagged: 'desc' }, { lastModified: 'desc' }]
        });

        const index = ordered.findIndex((item) => item.id === id);
        if (index === -1) return ok({ prevId: null, nextId: null });

        const prevId = ordered[index - 1]?.id ?? null;
        const nextId = ordered[index + 1]?.id ?? null;

        return ok({ prevId, nextId });
    } catch (e) {
        console.error(e);
        return serverError();
    }
}
