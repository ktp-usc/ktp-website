import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";


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


async function createNeonAuthUser(email: string, name: string) {
    //Creates random dummy password that is immediately reset by user
    const password = crypto.randomBytes(12).toString("hex");
    const authUrl = process.env.NEXT_NEON_AUTH_URL;
    const projectID = process.env.NEXT_NEON_AUTH_PROJECT_ID;
    const branchID = process.env.NEXT_NEON_AUTH_BRANCH_ID;

    if (!authUrl || !projectID || !branchID) {
        console.error("Missing Neon Auth env vars");
        return;
    }

    //Uses the Neon Auth API to create a new user with the given school email, name, and dummy password
    const response = await fetch(
        `https://console.neon.tech/api/v2/projects/${ projectID }/branches/${ branchID }/auth/users`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                Authorization: `Bearer ${ process.env.NEON_AUTH_API_KEY }`
            },
            body: JSON.stringify({
                email,
                name,
                password
            })
        }
    );

    if (!response.ok) {
        console.error("Failed to create Neon Auth user:", await response.text());
        return;
    }


    //returns Neon Auth user object to link with accounts table entry
    const data = await response.json();

    const appOrigin = process.env.ORIGIN_URL || "http://localhost:3000";
    //Sends password reset email to user to set their own password
    const emailResponse = await fetch(`${ authUrl }/request-password-reset`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json", "Origin": appOrigin
        },
        body: JSON.stringify({ email, redirectTo: `${ appOrigin }/Reset-Password` })
    });

    if (!emailResponse.ok) {
        console.warn(`User created, but failed to send reset email: ${ emailResponse.status }`, emailResponse.text());
    } else {
        console.log(`Verification email sent to ${ email }`);
    }

    // neon auth only returns id
    return { id: data.id, email: email, password: password };

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
                        `ktp-resumes/${ Date.now() }-${ resume.name }`,
                        buffer,
                        {
                            access: "public",
                            contentType: resume.type || "application/pdf",
                            token
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
        const firstName = fullName.split(" ")[0];
        const lastName = fullName.split(" ")[1];
        const authUser = await createNeonAuthUser(email, fullName);
        if (!authUser) {
            return NextResponse.json({ error: "Failed to create user authentication." }, { status: 500 });
        }

        const { id: userId, email: userEmail, password: password } = authUser;
        // ------------------------------
        // Insert into Neon using Prisma
        // ------------------------------

        //@TODO need to add logic for converting class to gradyear
        await prisma.accounts.create({
            data: {
                id: userId,
                firstName,
                lastName,
                personalEmail: userEmail,
                majors: major?.split(","),
                minors: minor?.split(","),
                type: "APPLICANT",
                resumeBlobURL: resumeUrl,
                linkedin: linkedin,
                github: github
            }
        });

        await prisma.applications.create({
            data: {
                fullName,
                email,
                classification,
                major,
                minor,
                reason,
                resumeUrl,
                eventsAttended,
                linkedin,
                github,
                accounts: {
                    connect: { id: userId },
                },
            },
        })

        console.log(`[EMAIL MOCK] To: ${ email }, Password: ${ password }`);

        return NextResponse.json({ ok: true, id: userId });

    } catch (err: unknown) {
        console.error("POST /api/applications error:", err);

        // Handle unique constraint violations (e.g., duplicate email/resume)
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
        ) {
            return NextResponse.json(
                { error: "An account with this email or resume already exists." },
                { status: 409 }
            );
        }

        // Generic error handling with safe narrowing
        if (err instanceof Error) {
            return NextResponse.json(
                { error: err.message || "Server error" },
                { status: 500 }
            );
        }

        // Fallback for non-Error values
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}

// ---------- GET /api/applications ----------
// Simple listing endpoint for an admin dashboard later
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseLimit(searchParams.get("limit"));

        const applications = await prisma.applications.findMany({
            take: limit,
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json({ ok: true, data: applications });
    } catch (err) {
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2021" // table or view not found
        ) {
            return NextResponse.json(
                { error: "Table \"applications\" not found. Ensure migrations have been applied." },
                { status: 500 }
            );
        }

        console.error("GET /api/applications error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
