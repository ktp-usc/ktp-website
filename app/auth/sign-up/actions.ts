"use server";

import { redirect } from "next/navigation";
import { authServer } from "@/lib/auth/server";
import { passwordMeetsRequirements } from "@/lib/passwordMeetsRequirements";
import { prisma } from "@/lib/prisma";

type SignUpState = { error?: string };

function isValidScEduEmail(email: string): boolean {
    const lower = email.toLowerCase().trim();
    const parts = lower.split("@");
    if (parts.length !== 2) return false;
    return parts[1].endsWith("sc.edu");
}

function splitName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { firstName: "john", lastName: "smith" };
    if (parts.length === 1) return { firstName: parts[0], lastName: "smith" };
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function signUpWithEmail(_prevState: SignUpState | null, formData: FormData): Promise<SignUpState> {
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const callbackURL = String(formData.get("callbackURL") || "/portal");

    if (!name) return { error: "Please enter your name." };
    if (!isValidScEduEmail(email)) return { error: "Please use a valid USC email address." };
    if (!passwordMeetsRequirements(password)) return { error: "Password does not meet requirements." };

    const { firstName, lastName } = splitName(name);

    // 1) create neon auth user
    const result = await authServer.signUp.email({
        email,
        password,
        name,
        callbackURL
    });

    if (result.error) return { error: result.error.message };

    const userId = result.data?.user?.id;
    if (!userId) return { error: "Account created but user id was missing. Please contact support." };

    // 2) create matching row in public.accounts
    await prisma.accounts.upsert({
        where: { id: userId },
        create: {
            id: userId,
            firstName,
            lastName,
            majors: [],
            minors: [],
            schoolEmail: email,
            isNew: true
        },
        update: {
            schoolEmail: email
        }
    });

    // match sign-in behavior: always redirect to callbackURL
    redirect(callbackURL);
}
