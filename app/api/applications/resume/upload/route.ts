import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json({ error: "Missing filename" }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error("Missing BLOB_READ_WRITE_TOKEN");
      return NextResponse.json({ error: "Missing token" }, { status: 500 });
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
    });

    return NextResponse.json(blob);
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
