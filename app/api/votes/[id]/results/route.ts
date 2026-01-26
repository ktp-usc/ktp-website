import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { badRequest, ok, serverError } from '@/lib/http/responses';
import { getVoterHash } from '@/lib/votes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  const authed = await requireAdmin();
  if ('response' in authed) return authed.response;

  const { id } = await ctx.params;

  try {
    const question = await prisma.vote_questions.findUnique({
      where: { id },
      include: { options: true }
    });

    if (!question) return badRequest('question_not_found');

    const eligible = await prisma.vote_eligibility.findMany({
      where: { questionId: id },
      select: { accountId: true }
    });

    const eligibleHashes = eligible.map((entry) => getVoterHash(entry.accountId));

    const votes = eligibleHashes.length
      ? await prisma.vote_votes.findMany({
          where: { questionId: id, voterHash: { in: eligibleHashes } },
          select: { optionId: true }
        })
      : [];

    const counts: Record<string, number> = {};
    question.options.forEach((opt) => {
      counts[opt.id] = 0;
    });
    votes.forEach((vote) => {
      if (counts[vote.optionId] !== undefined) counts[vote.optionId] += 1;
    });

    const totalVotes = votes.length;
    const options = question.options.map((opt) => {
      const count = counts[opt.id] ?? 0;
      const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      return { id: opt.id, label: opt.label, count, percent };
    });

    return ok({
      question: { id: question.id, question: question.question },
      totalVotes,
      options
    });
  } catch (e) {
    console.error('GET /api/votes/[id]/results error:', e);
    return serverError();
  }
}
