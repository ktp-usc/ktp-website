import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { badRequest, ok, serverError } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
    const authed = await requireAdmin();
    if ('response' in authed) return authed.response;

    const { id } = await ctx.params;
    if (!id) return badRequest('missing_id');

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return badRequest('invalid_json');
    }

    const eventsRaw = (body as { events?: unknown })?.events;
    if (!Array.isArray(eventsRaw)) return badRequest('events_must_be_array');
    const events = eventsRaw.map((value) => String(value).trim()).filter(Boolean);

    try {
        const updated = await prisma.applications.update({
            where: { id },
            data: { eventsAttended: events }
        });

        return ok(updated);
    } catch (err) {
        console.error('Server error saving events', err);
        return serverError();
    }
}
