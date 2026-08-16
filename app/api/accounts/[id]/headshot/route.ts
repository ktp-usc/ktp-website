import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

function json(status: number, body: unknown) {
    return NextResponse.json(body, { status });
}

function isImage(file: File) {
    return file.type.startsWith("image/");
}

function fileFromFormData(formData: FormData, key: string): File | null {
    const v = formData.get(key);
    return v instanceof File ? v : null;
}

export async function POST(req: Request, ctx: Ctx) {
    try {
        const authed = await requireAdmin();
        if ("response" in authed) return authed.response;

        const { id } = await ctx.params;

        const contentType = req.headers.get("content-type") ?? "";
        const isMultipart = contentType.includes("multipart/form-data");
        const isUrlEncoded = contentType.includes("application/x-www-form-urlencoded");

        if (!isMultipart && !isUrlEncoded) {
            return json(400, {
                error: "invalid_content_type",
                detail: "Expected multipart/form-data (send FormData without setting Content-Type manually)."
            });
        }

        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) return json(500, { error: "missing_blob_token" });

        const existing = await prisma.accounts.findUnique({ where: { id }, select: { id: true } });
        if (!existing) return json(404, { error: "account_not_found" });

        const formData = await req.formData();
        const file = fileFromFormData(formData, "headshot");

        if (!file || file.size === 0) return json(400, { error: "missing_headshot_file" });
        if (!isImage(file)) return json(400, { error: "headshot_must_be_image" });

        const buffer = await file.arrayBuffer();

        const blob = await put(`ktp-headshots/${id}-${Date.now()}-${file.name}`, buffer, {
            access: "public",
            contentType: file.type || "application/octet-stream",
            token
        });

        const updated = await prisma.accounts.update({
            where: { id },
            data: { headshotBlobURL: blob.url }
        });

        return json(200, { ok: true, url: blob.url, data: updated });
    } catch (e) {
        console.error("POST /api/accounts/[id]/headshot error:", e);
        return json(500, { error: "server_error" });
    }
}
