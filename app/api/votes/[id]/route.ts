import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { ok, serverError } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_: Request, ctx: Ctx) {
  const authed = await requireAdmin();
  if ('response' in authed) return authed.response;

  const { id } = await ctx.params;

  try {
    await prisma.vote_questions.delete({ where: { id } });
    return ok({ ok: true });
  } catch (e) {
    console.error('DELETE /api/votes/[id] error:', e);
    return serverError();
  }
}
