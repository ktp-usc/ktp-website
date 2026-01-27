import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { ok, serverError } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const authed = await requireAdmin();
  if ('response' in authed) return authed.response;

  try {
    const items = await prisma.vote_questions.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        options: true,
        _count: { select: { votes: true, eligible: true } }
      }
    });

    const itemsWithCounts = await Promise.all(
      items.map(async (item) => {
        const grouped = await prisma.vote_votes.groupBy({
          by: ['optionId'],
          where: { questionId: item.id },
          _count: { _all: true }
        });

        const counts = new Map(grouped.map((g) => [g.optionId, g._count._all]));

        const totalVotes = item._count.votes;

        return {
          id: item.id,
          question: item.question,
          isActive: item.isActive,
          createdAt: item.createdAt,
          closesAt: item.closesAt,
          options: item.options.map((opt) => ({
            id: opt.id,
            label: opt.label,
            count: counts.get(opt.id) ?? 0,
            percent: totalVotes > 0 ? Math.round(((counts.get(opt.id) ?? 0) / totalVotes) * 100) : 0
          })),
          totalVotes,
          eligibleCount: item._count.eligible
        };
      })
    );

    return ok({ items: itemsWithCounts });
  } catch (e) {
    console.error('GET /api/votes/history error:', e);
    return serverError();
  }
}
