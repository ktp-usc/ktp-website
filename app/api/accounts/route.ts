import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { ok, serverError } from '@/lib/http/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseIntParam(v: string | null, fallback: number) {
    const n = Number.parseInt(v ?? '', 10);
    return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: Request) {
    const authed = await requireAdmin();
    if ('response' in authed) return authed.response;

    try {
        const { searchParams } = new URL(req.url);

        const q = (searchParams.get('q') ?? '').trim();
        const type = (searchParams.get('type') ?? '').trim();
        const leaderType = (searchParams.get('leaderType') ?? '').trim();

        const takeRaw = parseIntParam(searchParams.get('take'), 25);
        const take = Math.min(Math.max(takeRaw, 1), 100);

        const skipRaw = parseIntParam(searchParams.get('skip'), 0);
        const skip = Math.max(skipRaw, 0);

        const where: any = {
            ...(type ? { type } : {}),
            ...(leaderType ? { leaderType } : {}),
            ...(q
                ? {
                    OR: [
                        { firstName: { contains: q, mode: 'insensitive' } },
                        { lastName: { contains: q, mode: 'insensitive' } },
                        { schoolEmail: { contains: q, mode: 'insensitive' } },
                        { personalEmail: { contains: q, mode: 'insensitive' } }
                    ]
                }
                : {})
        };

        const [items, total] = await Promise.all([
            prisma.accounts.findMany({
                where,
                orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
                take,
                skip
            }),
            prisma.accounts.count({ where })
        ]);

        return ok({ items, total, take, skip });
    } catch (e) {
        console.error('GET /api/accounts error:', e);
        return serverError();
    }
}
