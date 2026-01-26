import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/guards';
import { badRequest, ok, serverError } from '@/lib/http/responses';
import { getVoterHash } from '@/lib/votes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const authed = await requireUser();
  if ('response' in authed) return authed.response;

  const { id } = await ctx.params;

  try {
    const body = await req.json();
    const optionId = body?.optionId as string | undefined;
    if (!optionId) return badRequest('option_required');

    const question = await prisma.vote_questions.findUnique({
      where: { id },
      include: { options: true }
    });

    if (!question) return badRequest('question_not_found');
    if (!question.isActive) return badRequest('question_inactive');
    if (question.closesAt && question.closesAt.getTime() <= Date.now()) {
      return badRequest('question_closed');
    }

    const optionExists = question.options.some((opt) => opt.id === optionId);
    if (!optionExists) return badRequest('option_not_found');

    const eligibility = await prisma.vote_eligibility.findUnique({
      where: { questionId_accountId: { questionId: id, accountId: authed.user.id } }
    });

    if (!eligibility) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const voterHash = getVoterHash(authed.user.id);

    await prisma.$transaction(async (tx) => {
      await tx.vote_votes.upsert({
        where: { questionId_voterHash: { questionId: id, voterHash } },
        update: { optionId },
        create: { questionId: id, optionId, voterHash }
      });

      await tx.vote_eligibility.update({
        where: { id: eligibility.id },
        data: { hasVoted: true, votedAt: new Date() }
      });
    });

    return ok({ ok: true });
  } catch (e) {
    console.error('POST /api/votes/[id]/vote error:', e);
    return serverError();
  }
}
