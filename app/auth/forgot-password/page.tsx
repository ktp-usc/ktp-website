"use client";

import Background from "@/components/Background";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { useRequestPasswordResetMutation } from "@/client/hooks/auth";


export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(true);

    const requestReset = useRequestPasswordResetMutation();

    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleHomeClick = () => {
        document.documentElement.classList.remove("dark");
        router.push("/");
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        setIsEmailValid(value.trim().length > 0);
    };

    const handleResetClick = async () => {
        const trimmed = email.trim();
        const valid = trimmed.length > 0;

        setIsEmailValid(valid);
        setSubmitError(null);

        if (!valid) return;

        try {
            await requestReset.mutateAsync(trimmed);
            setIsSubmitted(true);
        } catch (err: any) {
            const message =
                (err?.message ?? "").toString().trim() ||
                "Failed to send reset email. Please try again.";
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
                            Reset your password
                        </h2>
                        <p className="text-lg lg:text-xl max-w-md text-white/90 leading-relaxed">
                            Enter your email and we&apos;ll send you a secure link to choose a new password.
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
                            { isSubmitted
                                ? "If an account exists for that email, we sent a password reset link/code. Check your inbox (and spam) and follow the instructions."
                                : "Enter your email address and we'll send you a reset link/code." }
                        </p>

                        <form className="space-y-5">
                            <div>
                                <label htmlFor="email"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="example@email.sc.edu"
                                    value={ email }
                                    onChange={ handleEmailChange }
                                    disabled={ requestReset.isPending || isSubmitted }
                                    className={ `w-full rounded-lg border px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                        !isEmailValid ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600" :
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
                                    Reset email sent. Check your inbox (and spam) for a password reset link, then follow the instructions to set a new password.
                                </div>
                            ) : null }

                            <button
                                type="button"
                                onClick={ handleResetClick }
                                disabled={ !isEmailValid || requestReset.isPending || isSubmitted }
                                className={ `w-full rounded-lg py-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg shadow-blue-500/30 ${
                                    !isEmailValid || requestReset.isPending || isSubmitted
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                }` }
                            >
                                { requestReset.isPending
                                    ? "Sending…"
                                    : isSubmitted
                                        ? "Email Sent"
                                        : "Reset Password" }
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}