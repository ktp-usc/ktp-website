import { prisma } from '@/lib/prisma';
import {Prisma} from '@prisma/client';
import { requireAdmin } from '@/lib/auth/guards';
import { ok, serverError } from '@/lib/http/responses';
import { id } from 'date-fns/locale';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request) {
    const authed = await requireAdmin();
    if ('response' in authed) return authed.response;

    try {
        const { searchParams } = new URL(req.url);

        const q = searchParams.get('q')?.trim() || '';
        const status = searchParams.get('status') || '';
        const flagged = searchParams.get('flagged');
        const take = Math.min(parseInt(searchParams.get('take') || '25', 10), 100);
        const skip = Math.max(parseInt(searchParams.get('skip') || '0', 10), 0);

        const where: any = {
            ...(status ? { status } : {}),
            ...(flagged === 'true' ? { isFlagged: true } : {}),
            ...(flagged === 'false' ? { isFlagged: false } : {}),
            ...(q
                ? {
                    OR: [
                        { fullName: { contains: q, mode: 'insensitive' } },
                        { email: { contains: q, mode: 'insensitive' } }
                    ]
                }
                : {})
        };

        const [items, total] = await Promise.all([
            prisma.applications.findMany({
                where,
                orderBy: [{ isFlagged: 'desc' }, { lastModified: 'desc' }],
                take,
                skip
            }),
            prisma.applications.count({ where })
        ]);

        return ok({ items, total, take, skip });
    } catch (e) {
        console.error(e);
        return serverError();
    }
}
