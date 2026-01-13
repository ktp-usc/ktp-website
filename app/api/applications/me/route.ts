import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authServer } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    const { data } = await authServer.getSession();
    const userId = data?.user?.id ?? null;

    if (!userId) return NextResponse.json({ application: null }, { status: 401 });

    const application = await prisma.applications.findUnique({
        where: { userId }
    });

    return NextResponse.json(
        { application },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    );
}

export async function PUT(req: Request) {
    const { data } = await authServer.getSession();
    const userId = data?.user?.id ?? null;
    const email = data?.user?.email ?? null;

    if (!userId) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

    const body = (await req.json()) as {
        classification?: string | null;
        major?: string | null;
        minor?: string | null;
        gpa?: number | null;
        linkedin?: string | null;
        github?: string | null;
        reason?: string | null;
        eventsAttended?: string[] | null;
    };

    const account = await prisma.accounts.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, resumeBlobURL: true }
    });

    if (!account) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });

    const fullName = `${account.firstName} ${account.lastName}`.trim();

    const existing = await prisma.applications.findUnique({ where: { userId } });

    // ✅ if already submitted, block edits
    if (existing?.submittedAt) {
        return NextResponse.json({ error: 'Application already submitted.' }, { status: 400 });
    }

    const application = await prisma.applications.upsert({
        where: { userId },
        create: {
            userId,
            fullName,
            email: email ?? '',
            classification: body.classification ?? null,
            major: body.major ?? null,
            minor: body.minor ?? null,
            gpa: body.gpa ?? null,
            linkedin: body.linkedin ?? null,
            github: body.github ?? null,
            reason: body.reason ?? null,
            eventsAttended: body.eventsAttended ?? [],
            resumeUrl: account.resumeBlobURL ?? null,
            lastModified: new Date()
        },
        update: {
            classification: body.classification ?? null,
            major: body.major ?? null,
            minor: body.minor ?? null,
            gpa: body.gpa ?? null,
            linkedin: body.linkedin ?? null,
            github: body.github ?? null,
            reason: body.reason ?? null,
            eventsAttended: body.eventsAttended ?? [],
            resumeUrl: account.resumeBlobURL ?? existing?.resumeUrl ?? null,
            lastModified: new Date()
        }
    });

    return NextResponse.json(
        { application },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    );
}
