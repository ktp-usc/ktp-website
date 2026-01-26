import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { ok, serverError } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Ctx = { params: Promise<{ id: string }> };

type EligibilityBody = {
  accountIds?: string[];
};

function formatName(first?: string | null, last?: string | null) {
  const safeFirst = (first ?? '').trim();
  const safeLast = (last ?? '').trim();
  return `${safeFirst} ${safeLast}`.trim() || 'Unnamed';
}

export async function GET(_: Request, ctx: Ctx) {
  const authed = await requireAdmin();
  if ('response' in authed) return authed.response;

  const { id } = await ctx.params;

  try {
    const [accounts, eligibility] = await Promise.all([
      prisma.accounts.findMany({
        where: { type: { in: ['BROTHER', 'LEADERSHIP'] } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          schoolEmail: true,
          personalEmail: true
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
      }),
      prisma.vote_eligibility.findMany({
        where: { questionId: id },
        select: { accountId: true, hasVoted: true }
      })
    ]);

    const eligibilityMap = new Map(eligibility.map((item) => [item.accountId, item]));

    const items = accounts.map((account) => {
      const entry = eligibilityMap.get(account.id);
      const email = account.schoolEmail ?? account.personalEmail ?? '';
      return {
        id: account.id,
        name: formatName(account.firstName, account.lastName),
        email,
        eligible: Boolean(entry),
        hasVoted: Boolean(entry?.hasVoted)
      };
    });

    return ok({ items });
  } catch (e) {
    console.error('GET /api/votes/[id]/eligibility error:', e);
    return serverError();
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  const authed = await requireAdmin();
  if ('response' in authed) return authed.response;

  const { id } = await ctx.params;

  try {
    const body = (await req.json()) as EligibilityBody;
    const accountIds = Array.isArray(body.accountIds) ? body.accountIds : [];

    if (!accountIds.length) {
      await prisma.vote_eligibility.deleteMany({ where: { questionId: id } });
      return ok({ ok: true });
    }

    const existing = await prisma.vote_eligibility.findMany({
      where: { questionId: id, accountId: { in: accountIds } },
      select: { accountId: true }
    });

    const existingSet = new Set(existing.map((row) => row.accountId));
    const toCreate = accountIds.filter((accountId) => !existingSet.has(accountId));

    await prisma.$transaction(async (tx) => {
      await tx.vote_eligibility.deleteMany({
        where: { questionId: id, accountId: { notIn: accountIds } }
      });

      if (toCreate.length) {
        await tx.vote_eligibility.createMany({
          data: toCreate.map((accountId) => ({ questionId: id, accountId })),
          skipDuplicates: true
        });
      }
    });

    return ok({ ok: true });
  } catch (e) {
    console.error('PUT /api/votes/[id]/eligibility error:', e);
    return serverError();
  }
}
