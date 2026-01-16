import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function uploadFile(file: File, prefix: string, token: string) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = await file.arrayBuffer();
  const blob = await put(`${prefix}/${Date.now()}-${file.name}`, buffer, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type || "application/octet-stream",
    token,
  } as any);
  return blob.url;
}

export async function POST(request: Request) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error("Missing BLOB_READ_WRITE_TOKEN");
      return NextResponse.json({ error: "Missing token" }, { status: 500 });
    }

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const resume = formData.get("resume");
      const photo = formData.get("photo");
      const response: Record<string, string> = {};

      if (resume instanceof File && resume.size > 0) {
        response.resumeUrl = await uploadFile(resume, "ktp-resumes", token);
      }

      if (photo instanceof File && photo.size > 0) {
        response.headshotUrl = await uploadFile(photo, "ktp-headshots", token);
      }

      if (!response.resumeUrl && !response.headshotUrl) {
        return NextResponse.json(
          { error: "No files provided." },
          { status: 400 }
        );
      }

      return NextResponse.json(response);
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json({ error: "Missing filename" }, { status: 400 });
    }

    if (!request.body) {
      return NextResponse.json(
        { error: "Empty request body" },
        { status: 400 }
      );
    }

    const blob = await put(filename, request.body, {
      access: "public",
      addRandomSuffix: true,
      token, // REQUIRED for local dev
    }as any);

    return NextResponse.json(blob);
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
