// app/api/accounts/[id]/resume/route.ts
import { NextResponse } from 'next/server';
import { del, put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

function json(status: number, body: unknown) {
    return NextResponse.json(body, { status });
}

function isPdf(file: File) {
    const type = (file.type || '').toLowerCase();
    return type === 'application/pdf' || type.includes('pdf');
}

function fileFromFormData(formData: FormData, key: string): File | null {
    const v = formData.get(key);
    return v instanceof File ? v : null;
}

// only blobs we own should be handed to del(); local-folder resumes have no blob
function isOwnedBlobUrl(url: string | null) {
    return Boolean(url && /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(url));
}

// exec replaces the resume on file for a given member
export async function POST(req: Request, ctx: Ctx) {
    const authed = await requireAdmin();
    if ('response' in authed) return authed.response;

    const { id } = await ctx.params;

    try {
        const contentType = req.headers.get('content-type') ?? '';
        if (!contentType.includes('multipart/form-data')) {
            return json(400, {
                error: 'invalid_content_type',
                detail: 'Expected multipart/form-data (send FormData without setting Content-Type manually).'
            });
        }

        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) return json(500, { error: 'missing_blob_token' });

        const existing = await prisma.accounts.findUnique({
            where: { id },
            select: { id: true, resumeBlobURL: true }
        });

        if (!existing) return json(404, { error: 'account_not_found' });

        const formData = await req.formData();
        const file = fileFromFormData(formData, 'resume');

        if (!file || file.size === 0) return json(400, { error: 'missing_resume_file' });
        if (!isPdf(file)) return json(400, { error: 'resume_must_be_pdf' });

        const buffer = await file.arrayBuffer();
        const safeName = file.name?.trim() || 'resume.pdf';

        const blob = await put(`ktp-resumes/${ id }-${ Date.now() }-${ safeName }`, buffer, {
            access: 'public',
            contentType: file.type || 'application/pdf',
            token
        });

        const updated = await prisma.accounts.update({
            where: { id },
            data: { resumeBlobURL: blob.url }
        });

        // best effort: drop the blob we just replaced so storage doesn't accumulate orphans
        if (isOwnedBlobUrl(existing.resumeBlobURL)) {
            await del(existing.resumeBlobURL!, { token }).catch((e) => {
                console.error(`POST /api/accounts/${ id }/resume stale blob cleanup failed:`, e);
            });
        }

        return json(200, { ok: true, url: blob.url, data: updated });
    } catch (e) {
        console.error(`POST /api/accounts/${ id }/resume error:`, e);
        return json(500, { error: 'server_error' });
    }
}

// exec clears the resume on file for a given member
export async function DELETE(_: Request, ctx: Ctx) {
    const authed = await requireAdmin();
    if ('response' in authed) return authed.response;

    const { id } = await ctx.params;

    try {
        const existing = await prisma.accounts.findUnique({
            where: { id },
            select: { id: true, resumeBlobURL: true }
        });

        if (!existing) return json(404, { error: 'account_not_found' });

        // Only unlink — deliberately NOT deleting the blob. Removal is a one-click action on
        // someone else's document, so the file stays in storage and can be recovered from the
        // Vercel blob dashboard if an exec removes the wrong person. Replacing a resume does
        // clean up its predecessor, since that case leaves a current file behind.
        const updated = await prisma.accounts.update({
            where: { id },
            data: { resumeBlobURL: null }
        });

        console.info(
            `resume unlinked for account ${ id }; orphaned blob retained: ${ existing.resumeBlobURL }`
        );

        return json(200, { ok: true, data: updated });
    } catch (e) {
        console.error(`DELETE /api/accounts/${ id }/resume error:`, e);
        return json(500, { error: 'server_error' });
    }
}
