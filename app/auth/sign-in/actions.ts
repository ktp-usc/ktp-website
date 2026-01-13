"use server";

import { redirect } from "next/navigation";
import { authServer } from "@/lib/auth/server";

type SignInState = { error?: string };

function isValidScEduEmail(email: string): boolean {
    const lower = email.toLowerCase().trim();
    const parts = lower.split("@");
    if (parts.length !== 2) return false;
    return parts[1].endsWith("sc.edu");
}

export async function signInWithEmail(_prevState: SignInState | null, formData: FormData): Promise<SignInState> {
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const callbackURL = String(formData.get("callbackURL") || "/portal");

    if (!email) return { error: "Please enter your email." };
    if (!password) return { error: "Please enter your password." };

    // optional: keep the same USC-only behavior as signup
    if (!isValidScEduEmail(email)) return { error: "Please use a valid USC email address." };

    const result = await authServer.signIn.email({
        email,
        password,
        callbackURL
        // rememberMe: true, // optional if you want it (supported in the SDK)
    });

    if (result.error) return { error: result.error.message };

    // if the SDK doesn't auto-redirect for you in this environment, do it here:
    redirect(callbackURL);
}
