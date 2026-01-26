import { NextRequest, NextResponse } from 'next/server';
import { neonAuthMiddleware } from '@neondatabase/auth/next/server';

const requireAuth = neonAuthMiddleware({
    loginUrl: '/auth/sign-in'
});

function isExecOnlyPath(pathname: string) {
    return (
        pathname.startsWith('/portal/exec')
        // add more exec-only prefixes here if needed
    );
}

export default async function middleware(req: NextRequest) {
    // 1) enforce authentication (existing behavior)
    const authResult = await requireAuth(req);
    if (authResult && authResult.status !== 200) {
        return authResult;
    }

    // 2) allow non-exec pages through
    if (!isExecOnlyPath(req.nextUrl.pathname)) {
        return NextResponse.next();
    }

    // 3) exec-only check via internal API (node runtime w/ prisma)
    const checkUrl = new URL('/api/authz/exec', req.nextUrl.origin);
    const res = await fetch(checkUrl, {
        headers: {
            cookie: req.headers.get('cookie') ?? ''
        }
    });

    if (res.ok) {
        return NextResponse.next();
    }

    // 4) block non-execs
    const redirect = new URL('/portal', req.nextUrl.origin);
    redirect.searchParams.set('error', 'exec_only');
    return NextResponse.redirect(redirect);
}

export const config = {
    matcher: [
        '/portal/:path*'
    ]
};