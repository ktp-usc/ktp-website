import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { number } from "zod";
import { gradSemester } from "@prisma/client";

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


function parseStringList(values: FormDataEntryValue[]): string[] {
    return values
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean);
}

// function parseGradSemester(value: string | null): Prisma.gradSemester | null {
//     if (!value) return null;
//     const normalized = value.trim().toUpperCase();
//     if (normalized === "FALL" || normalized === "SPRING") {
//         return normalized as Prisma.gradSemester;
//     }
//     return null;
// }

function isPdf(file: File) {
    return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function isImage(file: File) {
    return file.type.startsWith("image/");
}

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


async function createNeonAuthUser(email: string, name: string, password: string) {
    const authUrl =
        process.env.NEXT_NEON_AUTH_URL || process.env.NEXT_PUBLIC_NEON_AUTH_URL;

    if (!authUrl) {
        console.error("Missing NEXT_NEON_AUTH_URL for Neon Auth");
        return;
    }

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

    return { id: userId, email: email, password };

}

// ---------- POST /api/accounts ----------
export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const firstName = norm(formData.get("firstName"));
        const lastName = norm(formData.get("lastName"));
        const password = norm(formData.get("password"));
        const email = norm(formData.get("email"));
        const phone = norm(formData.get("phone"));
        const gradYearRaw = norm(formData.get("gradYear"));
        const major = norm(formData.get("major"));
        const minor = norm(formData.get("minor"));
        const hometown = norm(formData.get("hometown"));
        const linkedin = norm(formData.get("linkedin"));
        const github = norm(formData.get("github"));
        const gradSemesterRaw = norm(formData.get("gradSemester"));
        const pledgeClass = norm(formData.get("pledgeClass"));

        // const gradSemester = parseGradSemester(
        //     gradSemesterRaw || classificationValues[0] || null
        // );

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !major ||
            !linkedin ||
            !github ||
            !gradYearRaw
        ) {
            return NextResponse.json(
                { error: "Missing required signup fields." },
                { status: 400 }
            );
        }

        if (!password) {
            return NextResponse.json(
                { error: "Password is required." },
                { status: 400 }
            );
        }

        
        const gradSem: gradSemester = gradSemesterRaw as gradSemester;

        if (!isFinite((Number.parseInt(gradYearRaw)))) {
            return NextResponse.json(
                { error: "Grad year must be a valid number." },
                { status: 400 }
            );
        }

        if (!gradSemester) {
            return NextResponse.json(
                { error: "Graduating semester is required." },
                { status: 400 }
            );
        }

        if (!pledgeClass) {
            return NextResponse.json(
                { error: "Pledge class is required." },
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

        const fullName = `${ firstName } ${ lastName }`.trim();
        const authUser = await createNeonAuthUser(email, fullName, password);
        if (!authUser) {
            return NextResponse.json({ error: "Failed to create user authentication." }, { status: 500 });
        }

        const { id: userId, email: userEmail } = authUser;
        const majors = splitCommaList(major);
        const minors = splitCommaList(minor);
        // ------------------------------
        // Insert into Neon using Prisma
        // ------------------------------

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
                gradYear:Number.parseInt(gradYearRaw),
                gradSemester: gradSem,
                pledgeClass,
                linkedin: linkedin,
                github: github
            }
        });

        console.log(`[EMAIL MOCK] To: ${ email }, Password: ${ password }`);

        return NextResponse.json({ ok: true, id: userId });

    } catch (err: unknown) {
        console.error("POST /api/accounts error:", err);

        // Handle unique constraint violations (e.g., duplicate email/resume)
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
        ) {
            return NextResponse.json(
                { error: "An account with this email or file already exists." },
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

// ---------- GET /api/accounts ----------
// Simple listing endpoint for an admin dashboard later
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseLimit(searchParams.get("limit"));

        const accounts = await prisma.accounts.findMany({
            take: limit
        });

        return NextResponse.json({ ok: true, data: accounts });
    } catch (err) {
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2021" // table or view not found
        ) {
            return NextResponse.json(
                { error: "Table \"accounts\" not found. Ensure migrations have been applied." },
                { status: 500 }
            );
        }

        console.error("GET /api/accounts error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
