// app/api/applications/me/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/guards';
import { ok, created, badRequest, serverError } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function normalizeString(v: unknown): string | null {
    if (v === null || v === undefined) return null;
    if (typeof v !== 'string') return null;
    const s = v.trim();
    return s.length ? s : null;
}

function normalizeStringArray(v: unknown): string[] | undefined {
    // undefined => don't change
    if (v === undefined) return undefined;

    // null => clear
    if (v === null) return [];

    if (!Array.isArray(v)) return undefined;

    return v
        .map((x) => (typeof x === 'string' ? x.trim() : ''))
        .filter(Boolean);
}

function normalizeGpa(v: unknown): number | null | undefined {
    // undefined => don't change
    if (v === undefined) return undefined;

    // null/empty => clear
    if (v === null || v === '') return null;

    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return n;
}

export async function GET() {
    const authed = await requireUser();
    if ('response' in authed) return authed.response;

    try {
        const app = await prisma.applications.findUnique({
            where: { userId: authed.user.id },
            include: { comments: { orderBy: { createdAt: 'desc' } } }
        });

        return ok(app);
    } catch (e) {
        console.error(e);
        return serverError();
    }
}

export async function POST(req: Request) {
    const authed = await requireUser();
    if ('response' in authed) return authed.response;

    try {
        const body = await req.json().catch(() => null);
        if (!body) return badRequest('invalid_json');

        const fullName = normalizeString(body.fullName);
        const email = normalizeString(body.email);

        if (!fullName || !email) {
            return badRequest('fullName and email are required');
        }

        const app = await prisma.applications.create({
            data: {
                userId: authed.user.id,
                fullName,
                email,
                classification: normalizeString(body.classification),
                major: normalizeString(body.major),
                minor: normalizeString(body.minor),
                resumeUrl: normalizeString(body.resumeUrl),
                reason: normalizeString(body.reason),
                linkedin: normalizeString(body.linkedin),
                github: normalizeString(body.github),
                gpa: normalizeGpa(body.gpa) ?? null,
                eventsAttended: normalizeStringArray(body.eventsAttended) ?? []
            }
        });

        return created(app);
    } catch (e: any) {
        // unique violation: userId is unique
        console.error(e);
        return NextResponse.json({ error: 'application_already_exists' }, { status: 409 });
    }
}

export async function PATCH(req: Request) {
    const authed = await requireUser();
    if ('response' in authed) return authed.response;

    try {
        const body = await req.json().catch(() => null);
        if (!body) return badRequest('invalid_json');

        // only allow draft fields to be patched
        const data = {
            classification: body.classification === undefined ? undefined : normalizeString(body.classification),
            major: body.major === undefined ? undefined : normalizeString(body.major),
            minor: body.minor === undefined ? undefined : normalizeString(body.minor),
            resumeUrl: body.resumeUrl === undefined ? undefined : normalizeString(body.resumeUrl),
            reason: body.reason === undefined ? undefined : normalizeString(body.reason),
            eventsAttended: normalizeStringArray(body.eventsAttended),
            gpa: normalizeGpa(body.gpa)
            // lastModified is @updatedAt so prisma handles it
        } as const;

        // update-first (don’t create automatically on page load — only when user saves)
        try {
            const updated = await prisma.applications.update({
                where: { userId: authed.user.id },
                data
            });
            return ok(updated);
        } catch (e: any) {
            // not found -> create on save
            if (e?.code !== 'P2025') throw e;
        }

        // create fallback requires fullName/email (use body if provided, else derive from accounts)
        const account = await prisma.accounts.findUnique({
            where: { id: authed.user.id },
            select: { firstName: true, lastName: true, schoolEmail: true, personalEmail: true }
        });

        const derivedFullName =
            normalizeString(body.fullName) ??
            normalizeString(`${account?.firstName ?? 'john'} ${account?.lastName ?? 'smith'}`) ??
            'john smith';

        const derivedEmail =
            normalizeString(body.email) ??
            normalizeString(account?.schoolEmail) ??
            normalizeString(account?.personalEmail) ??
            'unknown@sc.edu';

        const createdApp = await prisma.applications.create({
            data: {
                userId: authed.user.id,
                fullName: derivedFullName,
                email: derivedEmail,
                classification: data.classification ?? null,
                major: data.major ?? null,
                minor: data.minor ?? null,
                resumeUrl: data.resumeUrl ?? null,
                reason: data.reason ?? null,
                gpa: data.gpa ?? null,
                eventsAttended: Array.isArray(data.eventsAttended) ? data.eventsAttended : []
            }
        });

        return ok(createdApp);
    } catch (e) {
        console.error(e);
        return serverError();
    }
}
