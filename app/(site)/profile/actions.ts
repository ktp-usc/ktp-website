"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { gradSemester as GradSemester, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { authServer } from "@/lib/auth/server";

type ActionState = { error?: string; success?: string };

function emptyToNull(v: FormDataEntryValue | null) {
    const s = String(v ?? "").trim();
    return s.length ? s : null;
}

function parseCommaList(v: FormDataEntryValue | null) {
    const s = String(v ?? "").trim();
    if (!s) return [];
    return s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
}

function parseIntOrNull(v: FormDataEntryValue | null) {
    const s = String(v ?? "").trim();
    if (!s) return null;
    const n = Number.parseInt(s, 10);
    return Number.isFinite(n) ? n : null;
}

function safeExtFromName(name: string) {
    const i = name.lastIndexOf(".");
    return i >= 0 ? name.slice(i).toLowerCase() : "";
}

function asEnum<T extends Record<string, string>>(enumObj: T, raw: string | null) {
    if (!raw) return null;
    return (Object.values(enumObj) as string[]).includes(raw) ? (raw as T[keyof T]) : null;
}

export async function updateProfile(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
    const { data } = await authServer.getSession();
    const userId = data?.user?.id ?? null;

    if (!userId) return { error: "Not signed in." };

    // ----------------------------
    // optional uploads (headshot/resume)
    // ----------------------------
    const headshot = formData.get("headshot");
    const resume = formData.get("resume");

    let uploadedHeadshotUrl: string | null = null;
    let uploadedResumeUrl: string | null = null;

    try {
        if (headshot instanceof File && headshot.size > 0) {
            if (!headshot.type.startsWith("image/")) return { error: "Headshot must be an image file." };

            const ext = safeExtFromName(headshot.name) || ".jpg";
            const key = `accounts/${ userId }/headshot-${ Date.now() }${ ext }`;

            const uploaded = await put(key, headshot, {
                access: "public",
                contentType: headshot.type
            });

            uploadedHeadshotUrl = uploaded.url;
        }

        if (resume instanceof File && resume.size > 0) {
            if (resume.type !== "application/pdf") return { error: "Resume must be a PDF." };

            const ext = safeExtFromName(resume.name) || ".pdf";
            const key = `accounts/${ userId }/resume-${ Date.now() }${ ext }`;

            const uploaded = await put(key, resume, {
                access: "public",
                contentType: resume.type
            });

            uploadedResumeUrl = uploaded.url;
        }
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload failed.";
        return { error: msg };
    }

    // ----------------------------
    // build prisma update payload
    // ----------------------------
    const majors = parseCommaList(formData.get("majors"));
    const minors = parseCommaList(formData.get("minors"));

    const gradSemester = asEnum(GradSemester, emptyToNull(formData.get("gradSemester"))) as GradSemester | null;

    const updateData: Prisma.accountsUpdateInput = {
        majors,
        minors,
        schoolEmail: emptyToNull(formData.get("schoolEmail")),
        gradSemester,
        phoneNum: emptyToNull(formData.get("phoneNum")),
        gradYear: parseIntOrNull(formData.get("gradYear")),
        hometown: emptyToNull(formData.get("hometown")),
        linkedin: emptyToNull(formData.get("linkedin")),
        github: emptyToNull(formData.get("github"))
    };

    // only overwrite blob urls if a new file was uploaded
    if (uploadedHeadshotUrl) updateData.headshotBlobURL = uploadedHeadshotUrl;
    if (uploadedResumeUrl) updateData.resumeBlobURL = uploadedResumeUrl;

    try {
        await prisma.accounts.upsert({
            where: { id: userId },
            update: updateData,
            create: {
                id: userId,
                majors,
                minors,
                schoolEmail: data?.user?.email ?? null,
                gradSemester,
                phoneNum: updateData.phoneNum as string | null,
                gradYear: updateData.gradYear as number | null,
                hometown: updateData.hometown as string | null,
                linkedin: updateData.linkedin as string | null,
                github: updateData.github as string | null,
                headshotBlobURL: uploadedHeadshotUrl,
                resumeBlobURL: uploadedResumeUrl
            }
        });

        revalidatePath("/profile");
        return { success: "Profile updated." };
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to update profile.";
        return { error: msg };
    }
}
