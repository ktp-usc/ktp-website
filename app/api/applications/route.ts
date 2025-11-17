import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fullName = body.fullName || "";
    const email = body.email || "";
    const classification = body.classification || null;
    const major = body.major || null;
    const minor = body.minor || null;
    const reason = body.reason || null;
    const resumeUrl = body.resumeUrl || null;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Full name and email are required." },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO applications (
        full_name,
        email,
        classification,
        major,
        minor,
        reason,
        resume_url
      )
      VALUES (
        ${fullName},
        ${email},
        ${classification},
        ${major},
        ${minor},
        ${reason},
        ${resumeUrl}
      )
      RETURNING id
    `;

    return NextResponse.json({ ok: true, id: rows[0].id });
  } catch (err) {
    console.error("POST /api/applications error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
