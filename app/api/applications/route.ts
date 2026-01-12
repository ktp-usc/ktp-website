
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

function fileFromFormData(formData: FormData, key: string): File | null {
    const value = formData.get(key);
    return value instanceof File ? value : null;
}

function splitCommaList(value: string | null): string[] {
    if (!value) return [];
    return value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
}

//Splits full name into first and last name
function parseName(fullName: string, preferredFirstName: string | null) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    const fallbackFirst = parts[0] || fullName.trim();
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
    return {
        firstName: preferredFirstName || fallbackFirst,
        lastName,
    };
}

function parseStringList(values: FormDataEntryValue[]): string[] {
    return values
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean);
}

function isPdf(file: File) {
    return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function isImage(file: File) {
    return file.type.startsWith("image/");
}

//Upload file to Vercel Blob Storage and returns Blob URL
async function uploadBlobFile(file: File, prefix: string, token: string) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const blob = await put(
        `${ prefix }/${ Date.now() }-${ file.name }`,
        buffer,
        {
            access: "public",
            contentType: file.type || "application/octet-stream",
            token
        }
    );
    return blob.url;
}


//Creates Neon Auth User using the given email and name
async function createNeonAuthUser(email: string, name: string) {
    const password = crypto.randomBytes(12).toString("hex");
    const authUrl =
        process.env.NEXT_NEON_AUTH_URL || process.env.NEXT_PUBLIC_NEON_AUTH_URL;

    if (!authUrl) {
        console.error("Missing NEXT_NEON_AUTH_URL for Neon Auth");
        return;
    }

    //Sets the app origin and then calls the Neon Auth sign-up endpoint
    const appOrigin = process.env.ORIGIN_URL || "http://localhost:3000";
    const response = await fetch(`${ authUrl }/sign-up/email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": appOrigin
        },
        body: JSON.stringify({
            email,
            name,
            password
        })
    });

    if (!response.ok) {
        console.error("Failed to create Neon Auth user:", await response.text());
        return;
    }

    const data = await response.json();
    const userId = data?.user?.id;
    if (!userId) {
        console.error("Neon Auth sign-up response missing user id.");
        return;
    }
    //Sends password reset email to user to set their own password, @TODO REDIRECT Reset URL BACK HERE 
    const emailResponse = await fetch(`${ authUrl }/request-password-reset`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json", "Origin": appOrigin
            },
        body: JSON.stringify({ email, redirectTo: `${ appOrigin }/login/forgotpassword` })
        });

    return { id: userId, email: email, password: password };

}

// ---------- POST /api/applications ----------
export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const fullName = norm(formData.get("name"));
        const preferredFirstName = norm(formData.get("preferredFirstName"));
        const email = norm(formData.get("email"));
        const phone = norm(formData.get("phone"));
        const classification = norm(formData.get("classification"));
        const gpa = norm(formData.get("gpa"));
        const extenuatingCircumstances = norm(formData.get("extenuatingCircumstances"));
        const major = norm(formData.get("major"));
        const minor = norm(formData.get("minor"));
        const hometown = norm(formData.get("hometown"));
        const reason = norm(formData.get("reason"));
        const linkedin = norm(formData.get("linkedin"));
        const github = norm(formData.get("github"));
        const affirmation = norm(formData.get("affirmation"));
        const eventsAttended = parseStringList(formData.getAll("rushEvents"));
        const signUp = norm(formData.get("signUp"));

        
        if (!fullName || !email || !phone || !gpa || !major || !reason) {
            return NextResponse.json(
                { error: "Missing required application fields." },
                { status: 400 }
            );
        }

        const emailDomain = email.toLowerCase().split("@")[1];
        if (!emailDomain || !emailDomain.endsWith("sc.edu")) {
            return NextResponse.json(
                { error: "Please use a valid USC email address." },
                { status: 400 }
            );
        }

        if (affirmation !== "yes") {
            return NextResponse.json(
                { error: "Application affirmation is required." },
                { status: 400 }
            );
        }

        if (eventsAttended.length === 0) {
            return NextResponse.json(
                { error: "Please select at least one rush event attended." },
                { status: 400 }
            );
        }

        const resumeFile = fileFromFormData(formData, "resume");
        if (!resumeFile || resumeFile.size === 0) {
            return NextResponse.json(
                { error: "Please upload a resume." },
                { status: 400 }
            );
        }
        if (!isPdf(resumeFile)) {
            return NextResponse.json(
                { error: "Resume must be a PDF file." },
                { status: 400 }
            );
        }

        const photoFile = fileFromFormData(formData, "photo");
        if (!photoFile || photoFile.size === 0) {
            return NextResponse.json(
                { error: "Please upload a headshot photo." },
                { status: 400 }
            );
        }
        if (!isImage(photoFile)) {
            return NextResponse.json(
                { error: "Headshot must be an image file." },
                { status: 400 }
            );
        }

        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
            console.error("Missing BLOB_READ_WRITE_TOKEN env var");
            return NextResponse.json(
                { error: "Missing blob storage configuration." },
                { status: 500 }
            );
        }

        let resumeUrl: string | null = null;
        let headshotUrl: string | null = null;
        try {
            resumeUrl = await uploadBlobFile(resumeFile, "ktp-resumes", token);
            headshotUrl = await uploadBlobFile(photoFile, "ktp-headshots", token);
        } catch (uploadErr) {
            console.error("File upload failed:", uploadErr);
            return NextResponse.json(
                { error: "File upload failed." },
                { status: 500 }
            );
        }

        const { firstName, lastName } = parseName(fullName, preferredFirstName);
        const authUser = await createNeonAuthUser(email, fullName);
        if (!authUser) {
            return NextResponse.json({ error: "Failed to create user authentication." }, { status: 500 });
        }

        const { id: userId, email: userEmail, password: password } = authUser;
        const majors = splitCommaList(major);
        const minors = splitCommaList(minor);

        // ------------------------------
        // Insert into Neon using Prisma
        // ------------------------------

        //@TODO need to add logic for converting class to gradyear
        await prisma.accounts.create({
            data: {
                id: userId,
                firstName,
                lastName,
                schoolEmail: userEmail,
                personalEmail: userEmail,
                phoneNum: phone,
                hometown: hometown,
                majors,
                minors,
                type: "APPLICANT",
                resumeBlobURL: resumeUrl,
                headshotBlobURL: headshotUrl,
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
