import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

const sql = neon(process.env.DATABASE_URL!);

// Normalize FormData values to clean strings or null
function norm(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s || null;
}

function parseLimit(v: string | null, fallback = 50, max = 200) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, max);
}

// ---------- POST /api/applications ----------
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const fullName = norm(formData.get("name"));
    const email = norm(formData.get("email"));
    const classification = norm(formData.get("classification"));
    const major = norm(formData.get("major"));
    const minor = norm(formData.get("minor"));
    const reason = norm(formData.get("reason"));
    const linkedin = norm(formData.get("linkedin"));
    const github = norm(formData.get("github"));

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Full name and email are required." },
        { status: 400 }
      );
    }

    // ------------------------------
    // Resume upload to Vercel Blob
    // ------------------------------
    let resumeUrl: string | null = null;

    const resume = formData.get("resume");
    if (resume instanceof File && resume.size > 0) {
      try {
        const arrayBuffer = await resume.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
          console.error("Missing BLOB_READ_WRITE_TOKEN env var");
        } else {
          const blob = await put(
            `ktp-resumes/${Date.now()}-${resume.name}`,
            buffer,
            {
              access: "public",
              contentType: resume.type || "application/pdf",
              token,
            }
          );

          resumeUrl = blob.url;
        }
      } catch (uploadErr) {
        console.error(
          "Resume upload failed, continuing without Blob:",
          uploadErr
        );
        // keep resumeUrl = null; do not throw
      }
    }

    // For now, we don't collect events from the UI – store empty array.
    const eventsAttended: string[] = [];

    // ------------------------------
    // Insert into Neon
    // ------------------------------
const rows = (await sql`
  INSERT INTO applications (
    full_name,
    email,
    classification,
    major,
    minor,
    reason,
    resume_url,
    events_attended,
    linkedin,
    github
  )
  VALUES (
    ${fullName},
    ${email},
    ${classification},
    ${major},
    ${minor},
    ${reason},
    ${resumeUrl},
    ${eventsAttended},
    ${linkedin},
    ${github}
  )
  RETURNING id
`) as { id: number }[];


    return NextResponse.json({ ok: true, id: rows[0]?.id ?? null });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "42P01") {
      // relation does not exist
      return NextResponse.json(
        {
          error:
            'Table "applications" not found. Create it in Neon:\n' +
            'CREATE TABLE IF NOT EXISTS applications (\n' +
            "  id BIGSERIAL PRIMARY KEY,\n" +
            "  full_name TEXT NOT NULL,\n" +
            "  email TEXT NOT NULL,\n" +
            "  classification TEXT,\n" +
            "  major TEXT,\n" +
            "  minor TEXT,\n" +
            "  resume_url TEXT,\n" +
            "  created_at TIMESTAMPTZ DEFAULT now(),\n" +
            "  reason TEXT,\n" +
            "  events_attended TEXT[] NOT NULL DEFAULT '{}',\n" +
            "  linkedin TEXT,\n" +
            "  github TEXT\n" +
            ");",
        },
        { status: 500 }
      );
    }

    console.error("POST /api/applications error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ---------- GET /api/applications ----------
// Simple listing endpoint for an admin dashboard later
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseLimit(searchParams.get("limit"));

const rows = (await sql`
  SELECT
    id,
    full_name,
    email,
    classification,
    major,
    minor,
    reason,
    resume_url,
    events_attended,
    linkedin,
    github,
    created_at
  FROM applications
  ORDER BY created_at DESC
  LIMIT ${limit}
`) as {
  id: number;
  full_name: string;
  email: string;
  classification: string | null;
  major: string | null;
  minor: string | null;
  reason: string | null;
  resume_url: string | null;
  events_attended: string[];
  linkedin: string | null;
  github: string | null;
  created_at: string;
}[];


    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "42P01") {
      return NextResponse.json(
        {
          error:
            'Table "applications" not found. See POST route hint for the CREATE TABLE SQL.',
        },
        { status: 500 }
      );
    }

    console.error("GET /api/applications error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
