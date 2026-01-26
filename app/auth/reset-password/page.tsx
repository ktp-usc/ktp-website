"use client";
import Background from "@/components/Background";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useResetPasswordMutation } from "@/client/hooks/auth";


export default function ResetPasswordPage() {
    const router = useRouter();

    const searchParams = useSearchParams();

    const token = useMemo(() => {
        const raw = searchParams.get("token");
        return raw && raw.trim().length > 0 ? raw.trim() : null;
    }, [searchParams]);

    const resetPassword = useResetPasswordMutation();

    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [, setIsNewPasswordValid] = useState(true);
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);
    const [showNewPasswordError, setShowNewPasswordError] = useState(false);

    const handleHomeClick = () => {
        document.documentElement.classList.remove("dark");
        router.push("/");
    };

    const validatePassword = (password: string) => {
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        const hasMinLength = password.length >= 8;
        return hasUppercase && hasLowercase && hasNumber && hasSymbol && hasMinLength;
    };

    const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewPassword(value);
        const valid = validatePassword(value);
        setIsNewPasswordValid(valid);
        setShowNewPasswordError(!valid && value.length > 0);
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);
        const matches = value === newPassword && value.length > 0;
        setIsConfirmPasswordValid(matches);
    };

    const canSubmit =
        Boolean(token) &&
        validatePassword(newPassword) &&
        confirmPassword.length > 0 &&
        confirmPassword === newPassword;

    const handleResetSubmit = async () => {
        setSubmitError(null);

        const newValid = validatePassword(newPassword);
        setIsNewPasswordValid(newValid);
        setShowNewPasswordError(!newValid && newPassword.length > 0);

        const confirmValid = confirmPassword === newPassword && confirmPassword.length > 0;
        setIsConfirmPasswordValid(confirmValid);

        if (!token) {
            setSubmitError("Reset token is missing or invalid. Please request a new password reset email.");
            return;
        }

        if (!newValid || !confirmValid) return;

        try {
            await resetPassword.mutateAsync({ token, password: newPassword });
            setIsSubmitted(true);
        } catch (err: any) {
            const message =
                (err?.message ?? "").toString().trim() ||
                "Failed to reset password. Please request a new reset email and try again.";
            setSubmitError(message);
            setIsSubmitted(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 dark:bg-gray-900 transition-colors duration-300">
            <ThemeToggle/>

            {/* Left Side - Gradient Background Section */ }
            <div className="relative hidden md:flex">

                <Background className="absolute inset-0"/>
                <button
                    onClick={ handleHomeClick }
                    className="fixed top-6 left-12 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm"
                    aria-label="Return to homepage"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={ 2 }
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Home
                </button>
                <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">

                    <div className="space-y-6">

                        <div className="inline-block">
                            <Image
                                src="/KTPLettersW.svg"
                                alt="Kappa Theta Pi logo"
                                width={ 220 }
                                height={ 140 }
                                priority
                            />
                            <div className="h-1 w-20 bg-white/80 rounded-full"></div>
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-white">
                            Choose a new password
                        </h2>
                        <p className="text-lg lg:text-xl max-w-md text-white/90 leading-relaxed">
                            Set a strong new password for your account. Once it&apos;s updated, you&apos;ll be able to
                            sign in again.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Reset Password Form */ }
            <div
                className="flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */ }
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/KTPLettersW.svg"
                            alt="Kappa Theta Pi logo"
                            className="hidden dark:block"
                            width={ 120 }
                            height={ 40 }
                        />
                        <Image
                            src="/KTPLetters.svg"
                            alt="Kappa Theta Pi logo"
                            className="block dark:hidden"
                            width={ 120 }
                            height={ 40 }
                        />

                    </div>
                    {/* Form Container */ }
                    <div
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-gray-900/50 p-8 lg:p-10 transition-colors duration-300 border dark:border-gray-700">
                        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Reset Password</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-5">
                            { token
                                ? "Enter and confirm your new password."
                                : "This password reset link is invalid or has expired." }
                        </p>

                        { token ? (
                            <form className="space-y-5">
                                <div>
                                    <label htmlFor="newPassword"
                                           className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Enter new password
                                    </label>
                                    <input
                                        id="newPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={ newPassword }
                                        onChange={ handleNewPasswordChange }
                                        disabled={ resetPassword.isPending || isSubmitted || !token }
                                        className={ `w-full rounded-lg border px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            showNewPasswordError ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600" :
                                                "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                        }` }
                                    />
                                    { showNewPasswordError && (
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                            Require 1 uppercase, 1 lowercase, 1 number, 1 symbol, with a total of 8 or
                                            more
                                            characters
                                        </p>
                                    ) }
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword"
                                           className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Confirm new password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={ confirmPassword }
                                        onChange={ handleConfirmPasswordChange }
                                        disabled={ resetPassword.isPending || isSubmitted || !token }
                                        className={ `w-full rounded-lg border px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            !isConfirmPasswordValid && confirmPassword.length > 0 ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600" :
                                                isConfirmPasswordValid && confirmPassword.length > 0 ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600" :
                                                    "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                        }` }
                                    />
                                </div>

                                { submitError ? (
                                    <div
                                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                                        { submitError }
                                    </div>
                                ) : null }

                                { isSubmitted ? (
                                    <div
                                        className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200">
                                        Password updated. You can now{ " " }
                                        <Link href="/auth/sign-in"
                                              className="font-semibold underline underline-offset-2">
                                            sign in
                                        </Link>
                                        .
                                    </div>
                                ) : null }

                                <button
                                    type="button"
                                    onClick={ handleResetSubmit }
                                    disabled={ !canSubmit || resetPassword.isPending || isSubmitted }
                                    className={ `w-full rounded-lg py-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg shadow-blue-500/30 ${
                                        !canSubmit || resetPassword.isPending || isSubmitted
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                    }` }
                                >
                                    { resetPassword.isPending ? "Updating…" : isSubmitted ? "Password Updated" : "Reset Password" }
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    To reset your password, you’ll need to request a new reset email.
                                </p>
                                <Link
                                    href="/auth/forgot-password"
                                    className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Go to forgot password
                                </Link>
                            </div>
                        ) }
                    </div>
                </div>
            </div>
        </div>
    );
}