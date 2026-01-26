import { prisma } from '@/lib/prisma';
import { authServer } from '@/lib/auth/server';
import { ok, serverError } from '@/lib/http/responses';
import { getVoterHash } from '@/lib/votes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const question = await prisma.vote_questions.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { options: true }
    });

    if (!question) {
      return ok({ question: null, eligible: false, hasVoted: false });
    }

    const session = await authServer.getSession();
    const userId = session.data?.user?.id;

    if (!userId) {
      return ok({ question, eligible: false, hasVoted: false });
    }

    const eligibility = await prisma.vote_eligibility.findUnique({
      where: { questionId_accountId: { questionId: question.id, accountId: userId } }
    });

    const eligible = Boolean(eligibility);
    let hasVoted = Boolean(eligibility?.hasVoted);

    if (!hasVoted && eligible) {
      const voterHash = getVoterHash(userId);
      const existing = await prisma.vote_votes.findUnique({
        where: { questionId_voterHash: { questionId: question.id, voterHash } },
        select: { id: true }
      });
      hasVoted = Boolean(existing);
    }

    return ok({ question, eligible, hasVoted });
  } catch (e) {
    console.error('GET /api/votes/active error:', e);
    return serverError();
  }
}
