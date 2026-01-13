import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authServer } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isValidUrl(s: string | null) {
    if (!s) return false;
    try {
        new URL(s);
        return true;
    } catch {
        return false;
    }
}

export async function POST() {
    const { data } = await authServer.getSession();
    const userId = data?.user?.id ?? null;

    if (!userId) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

    const app = await prisma.applications.findUnique({ where: { userId } });
    if (!app) return NextResponse.json({ error: 'No draft application found.' }, { status: 400 });

    if (app.submittedAt) {
        return NextResponse.json({ error: 'Application already submitted.' }, { status: 400 });
    }

    // ✅ minimal validation (adjust as you want)
    if (!app.reason || app.reason.trim().length < 20) {
        return NextResponse.json({ error: 'Please add a longer reason (at least 20 characters).' }, { status: 400 });
    }

    if (app.linkedin && !isValidUrl(app.linkedin)) {
        return NextResponse.json({ error: 'LinkedIn must be a valid URL.' }, { status: 400 });
    }

    if (app.github && !isValidUrl(app.github)) {
        return NextResponse.json({ error: 'GitHub must be a valid URL.' }, { status: 400 });
    }

    const updated = await prisma.applications.update({
        where: { userId },
        data: {
            submittedAt: new Date(),
            lastModified: new Date()
        }
    });

    return NextResponse.json(
        { application: updated },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    );
}
