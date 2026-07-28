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

    // 2) role lookup via internal API (node runtime w/ prisma)
    const checkUrl = new URL('/api/authz/portal', req.nextUrl.origin);
    const res = await fetch(checkUrl, {
        headers: {
            cookie: req.headers.get('cookie') ?? ''
        }
    });

    const access = res.ok
        ? ((await res.json().catch(() => null)) as
            | { hasAccount: boolean; isExec: boolean; isEmployer: boolean }
            | null)
        : null;

    // 3) employer-only accounts have no member portal. `hasAccount` keeps anyone who is
    //    both a member and an approved employer from locking themselves out.
    if (access?.isEmployer && !access.hasAccount) {
        return NextResponse.redirect(new URL('/employers/resumes', req.nextUrl.origin));
    }

    // 4) allow non-exec pages through
    if (!isExecOnlyPath(req.nextUrl.pathname)) {
        return NextResponse.next();
    }

    // 5) exec-only check
    if (access?.isExec) {
        return NextResponse.next();
    }

    // 6) block non-execs
    const redirect = new URL('/portal', req.nextUrl.origin);
    redirect.searchParams.set('error', 'exec_only');
    return NextResponse.redirect(redirect);
}

export const config = {
    matcher: [
        '/portal/:path*'
    ]
};