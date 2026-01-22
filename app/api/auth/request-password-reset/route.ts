// app/api/auth/request-password-reset/route.ts
import { NextResponse } from 'next/server';
import { authServer } from '@/lib/auth/server';

export const runtime = 'nodejs';

function json(status: number, body: unknown) {
    return NextResponse.json(body, { status });
}

export async function POST(req: Request) {
    try {
        const { email } = (await req.json()) as { email?: string };

        if (!email) {
            return json(400, { code: 'BAD_REQUEST', message: 'email is required' });
        }

        // derive the origin so this works on localhost + vercel previews + prod
        const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL;
        if (!origin) {
            return json(500, { code: 'MISSING_ORIGIN', message: 'unable to determine origin' });
        }

        const redirectTo = `${origin}/auth/reset-password`;

        const { error } = await authServer.requestPasswordReset({
            email,
            redirectTo
        });

        // avoid user enumeration: always return ok (even if email not found)
        if (error) {
            console.error('[request-password-reset] error', error.message);
        }

        return json(200, { ok: true });
    } catch (err) {
        console.error('[request-password-reset] failed', err);
        return json(500, { code: 'INTERNAL_ERROR' });
    }
}
