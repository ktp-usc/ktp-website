// app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import { authServer } from '@/lib/auth/server';

export const runtime = 'nodejs';

function json(status: number, body: unknown) {
    return NextResponse.json(body, { status });
}

export async function POST(req: Request) {
    try {
        const { token, code, password } = (await req.json()) as {
            token?: string;
            code?: string;
            password?: string;
        };

        if (!password) {
            return json(400, { code: 'BAD_REQUEST', message: 'password is required' });
        }

        // Neon reset links may provide a token or a code depending on configuration.
        // Pass through whichever one exists.
        const resetToken = token ?? code;
        if (!resetToken) {
            return json(400, { code: 'BAD_REQUEST', message: 'missing reset token/code' });
        }

        const { error } = await authServer.resetPassword({
            token: resetToken,
            newPassword: password
        });

        if (error) {
            return json(400, { code: 'RESET_FAILED', message: error.message });
        }

        return json(200, { ok: true });
    } catch (err) {
        console.error('[reset-password] failed', err);
        return json(500, { code: 'INTERNAL_ERROR' });
    }
}
