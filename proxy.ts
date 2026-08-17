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

function isCalendarPath(pathname: string) {
    return pathname.startsWith('/calendar');
}

export default async function middleware(req: NextRequest) {
    // 1) enforce authentication (existing behavior) — this also covers
    // /calendar now that it's included in the matcher below, so signed-out
    // visitors get bounced to sign-in before we even look at their account.
    const authResult = await requireAuth(req);
    if (authResult && authResult.status !== 200) {
        return authResult;
    }

    const pathname = req.nextUrl.pathname;

    // 2) exec-only check via internal API (node runtime w/ prisma)
    if (isExecOnlyPath(pathname)) {
        const checkUrl = new URL('/api/authz/exec', req.nextUrl.origin);
        const res = await fetch(checkUrl, {
            headers: {
                cookie: req.headers.get('cookie') ?? ''
            }
        });

        if (res.ok) {
            return NextResponse.next();
        }

        // block non-execs
        const redirect = new URL('/portal', req.nextUrl.origin);
        redirect.searchParams.set('error', 'exec_only');
        return NextResponse.redirect(redirect);
    }

    // 3) calendar: members (brothers/exec/alumni) and rushees (PNMs) only
    if (isCalendarPath(pathname)) {
        const checkUrl = new URL('/api/authz/calendar', req.nextUrl.origin);
        const res = await fetch(checkUrl, {
            headers: {
                cookie: req.headers.get('cookie') ?? ''
            }
        });

        if (res.ok) {
            return NextResponse.next();
        }

        // block applicants / anyone without a qualifying account type
        const redirect = new URL('/', req.nextUrl.origin);
        redirect.searchParams.set('error', 'calendar_restricted');
        return NextResponse.redirect(redirect);
    }

    // 4) everything else in the matcher just needs to be signed in
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/portal/:path*',
        '/calendar/:path*'
    ]
};
