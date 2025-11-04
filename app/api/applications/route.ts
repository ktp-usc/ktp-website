import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Neon works great on the Edge runtime; also disable caching for this route
export const runtime = "edge";
export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

// ---------- Helpers ----------
const norm = (v: unknown) =>
  (typeof v === "string" ? v.trim() : v ?? "").toString().trim() || null;

function parseLimit(v: string | null, fallback = 50, max = 200) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, max);
}

// ---------- POST /api/applications ----------
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const fullName = norm(body.fullName);
    const email = norm(body.email);
    const classification = norm(body.classification);
    const major = norm(body.major);
    const minor = norm(body.minor);
    const resumeUrl = norm(body.resumeUrl); // optional for now

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Full name and email are required." },
        { status: 400 }
      );
    }

    const rows = await sql<
      { id: number }[]
    >`
      INSERT INTO applications (full_name, email, classification, major, minor, resume_url)
      VALUES (${fullName}, ${email}, ${classification}, ${major}, ${minor}, ${resumeUrl})
      RETURNING id
    `;

    return NextResponse.json({ ok: true, id: rows[0]?.id ?? null });
  } catch (err: any) {
    // Helpful local hints if the table doesn't exist
    if (err?.code === "42P01") {
      // relation does not exist
      return NextResponse.json(
        {
          error:
            'Table "applications" not found. Create it in Neon:\n' +
            'CREATE TABLE IF NOT EXISTS applications (\n' +
            '  id BIGSERIAL PRIMARY KEY,\n' +
            '  full_name TEXT NOT NULL,\n' +
            '  email TEXT NOT NULL,\n' +
            '  classification TEXT,\n' +
            '  major TEXT,\n' +
            '  minor TEXT,\n' +
            '  resume_url TEXT,\n' +
            '  created_at TIMESTAMPTZ DEFAULT now()\n' +
            ');',
        },
        { status: 500 }
      );
    }

    console.error("POST /applications error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ---------- GET /api/applications ----------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseLimit(searchParams.get("limit"));

    const rows = await sql<
      {
        id: number;
        full_name: string;
        email: string;
        classification: string | null;
        major: string | null;
        minor: string | null;
        resume_url: string | null;
        created_at: string;
      }[]
    >`
      SELECT id, full_name, email, classification, major, minor, resume_url, created_at
      FROM applications
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({ ok: true, data: rows });
  } catch (err: any) {
    if (err?.code === "42P01") {
      return NextResponse.json(
        {
          error:
            'Table "applications" not found. See POST route hint for the CREATE TABLE SQL.',
        },
        { status: 500 }
      );
    }

    console.error("GET /applications error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
