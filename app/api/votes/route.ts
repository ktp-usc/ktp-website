import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { badRequest, created, serverError } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type CreateVoteBody = {
  question?: string;
  options?: string[];
  eligibleAccountIds?: string[];
  isActive?: boolean;
  closesAt?: string | null;
};

function normalizeOptions(options: string[]): string[] {
  const cleaned = options
    .map((opt) => opt.trim())
    .filter(Boolean)
    .map((opt) => opt.replace(/\s+/g, ' '));
  return Array.from(new Set(cleaned));
}

export async function POST(req: Request) {
  const authed = await requireAdmin();
  if ('response' in authed) return authed.response;

  try {
    const body = (await req.json()) as CreateVoteBody;
    const question = body.question?.trim() ?? '';
    const rawOptions = Array.isArray(body.options) ? body.options : [];
    const options = normalizeOptions(rawOptions);

    if (!question) return badRequest('question_required');
    if (options.length < 2) return badRequest('options_required');

    const eligibleAccountIds = Array.isArray(body.eligibleAccountIds) ? body.eligibleAccountIds : [];
    const isActive = body.isActive !== false;
    const closesAt = body.closesAt ? new Date(body.closesAt) : null;

    const createdQuestion = await prisma.$transaction(async (tx) => {
      if (isActive) {
        await tx.vote_questions.updateMany({ data: { isActive: false } });
      }

      const questionRecord = await tx.vote_questions.create({
        data: {
          question,
          isActive,
          closesAt,
          createdById: authed.user.id
        }
      });

      await tx.vote_options.createMany({
        data: options.map((label) => ({
          questionId: questionRecord.id,
          label
        }))
      });

      if (eligibleAccountIds.length > 0) {
        await tx.vote_eligibility.createMany({
          data: eligibleAccountIds.map((accountId) => ({
            questionId: questionRecord.id,
            accountId
          })),
          skipDuplicates: true
        });
      }

      return questionRecord;
    });

    const fullQuestion = await prisma.vote_questions.findUnique({
      where: { id: createdQuestion.id },
      include: { options: true }
    });

    return created(fullQuestion);
  } catch (e) {
    console.error('POST /api/votes error:', e);
    return serverError();
  }
}
