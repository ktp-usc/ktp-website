import { requireUser } from '@/lib/auth/guards';
import { findEmployerByEmail } from '@/lib/auth/employers';
import { ok, serverError } from '@/lib/http/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const authed = await requireUser();
  if ('response' in authed) return authed.response;

  try {
    const employer = await findEmployerByEmail(authed.user.email);

    return ok(employer);
  } catch (e) {
    console.error('GET /api/employers/me error:', e);
    return serverError();
  }
}
