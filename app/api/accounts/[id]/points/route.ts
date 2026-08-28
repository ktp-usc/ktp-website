import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { badRequest, ok, serverError } from "@/lib/http/responses";
import { adjustAccountPoints } from "@/lib/points/award";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const authed = await requireAdmin();
  if ("response" in authed) return authed.response;

  try {
    const { id: accountId } = await ctx.params;
    const body = await req.json();
    const delta = Number(body.delta);

    if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 1000) {
      return badRequest("delta_must_be_a_non_zero_integer");
    }

    const account = await prisma.accounts.findUnique({
      where: { id: accountId },
      select: { id: true },
    });
    if (!account) return badRequest("account_not_found");

    const updated = await adjustAccountPoints(accountId, delta);
    return ok(updated);
  } catch (error) {
    console.error("POST /api/accounts/[id]/points error:", error);
    return serverError();
  }
}
