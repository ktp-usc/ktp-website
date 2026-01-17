// app/api/accounts/me/resume/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { authServer } from '@/lib/auth/server';

export const runtime = 'nodejs';

function json(status: number, body: unknown) {
    return NextResponse.json(body, { status });
}

function isPdf(file: File) {
    // browsers typically send: application/pdf
    // some edge cases can be octet-stream; if you want to be stricter, remove the fallback
    const type = (file.type || '').toLowerCase();
    return type === 'application/pdf' || type.includes('pdf');
}

function fileFromFormData(formData: FormData, key: string): File | null {
    const v = formData.get(key);
    return v instanceof File ? v : null;
}

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get('content-type') ?? '';
        const isMultipart = contentType.includes('multipart/form-data');
        const isUrlEncoded = contentType.includes('application/x-www-form-urlencoded');

        if (!isMultipart && !isUrlEncoded) {
            return json(400, {
                error: 'invalid_content_type',
                detail: 'Expected multipart/form-data (send FormData without setting Content-Type manually).'
            });
        }

        const session = await authServer.getSession();
        const authed = session?.data;
        if (!authed?.user?.id) return json(401, { error: 'unauthorized' });

        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) return json(500, { error: 'missing_blob_token' });

        const formData = await req.formData();
        const file = fileFromFormData(formData, 'resume');

        if (!file || file.size === 0) return json(400, { error: 'missing_resume_file' });
        if (!isPdf(file)) return json(400, { error: 'resume_must_be_pdf' });

        // optional: basic size guard (e.g., 10mb)
        // if (file.size > 10 * 1024 * 1024) return json(400, { error: 'resume_too_large' });

        const buffer = await file.arrayBuffer();

        const safeName = file.name?.trim() || 'resume.pdf';
        const blob = await put(`ktp-resumes/${authed.user.id}-${Date.now()}-${safeName}`, buffer, {
            access: 'public',
            contentType: file.type || 'application/pdf',
            token
        });

        const updated = await prisma.accounts.update({
            where: { id: authed.user.id },
            data: { resumeBlobURL: blob.url }
        });

        return json(200, { ok: true, url: blob.url, data: updated });
    } catch (e) {
        console.error('POST /api/accounts/me/resume error:', e);
        return json(500, { error: 'server_error' });
    }
}
