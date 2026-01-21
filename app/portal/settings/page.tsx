// app/portal/settings/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { User } from "lucide-react";

import { useSessionQuery, useSignOutMutation } from "@/client/hooks/auth";
import {
    useMyAccountQuery,
    useUpdateMyAccountMutation,
    useUploadHeadshotMutation,
    useUploadResumeMutation
} from "@/client/hooks/accounts";
import HeadshotCropModal from "@/app/portal/settings/HeadshotCropModal";
import BackButton from "@/components/BackButton";

function joinList(list: string[] | null | undefined) {
    return (list ?? []).join(", ");
}

function splitList(value: string) {
    return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

export default function SettingsPage() {
    const router = useRouter();

    const [saving, setSaving] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const [showCropModal, setShowCropModal] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);

    // new setup: session + /api/accounts/me are the sources of truth
    const session = useSessionQuery();
    const signOut = useSignOutMutation();
    const userId = session.data?.user?.id ?? null;

    const accountQuery = useMyAccountQuery();
    const account = accountQuery.data ?? null;

    const updateAccount = useUpdateMyAccountMutation();
    const uploadHeadshot = useUploadHeadshotMutation();
    const uploadResume = useUploadResumeMutation();

    const loading = session.isFetching || accountQuery.isFetching;

    const [user, setUser] = useState({
        name: "",
        email: "",
        phone: "",
        graduation: "",
        headshot: "",
        LinkedIn: "",
        GitHub: "",
        bio: "",
        type: "",
        exec: false,
        pc: "",

        // keep these in state so save can still write them to prisma (just not shown in UI)
        major: "",
        minor: "",
        gpa: ""
    });

    useEffect(() => {
        const darkMode = document.documentElement.classList.contains("dark");
        setIsDark(darkMode);
    }, []);

    useEffect(() => {
        if (!account) return;

        const fullName = `${ account.firstName ?? "" } ${ account.lastName ?? "" }`.trim();
        const headshotUrl = account.headshotBlobURL ?? "";

        setUser((prev) => ({
            ...prev,
            name: fullName,
            email: account.schoolEmail ?? account.personalEmail ?? "",
            phone: account.phoneNum ?? "",
            graduation: account.gradYear != null ? String(account.gradYear) : "",
            headshot: headshotUrl,
            LinkedIn: account.linkedin ?? "",
            GitHub: account.github ?? "",
            bio: prev.bio ?? "",
            type: account.type ?? "",
            exec: account.type === "LEADERSHIP",
            pc: "2026",

            // still hydrate but not displayed
            major: joinList(account.majors),
            minor: joinList(account.minors),
            gpa: ""
        }));
    }, [account]);

    function formatPhone(value: string) {
        const digits = value.replace(/\D/g, "").slice(0, 10);

        const parts = [];
        if (digits.length > 0) parts.push("(" + digits.slice(0, 3));
        if (digits.length >= 4) parts.push(") " + digits.slice(3, 6));
        if (digits.length >= 7) parts.push("-" + digits.slice(6, 10));

        return parts.join("");
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setUser((prev) => ({
            ...prev,
            [name]: name === "phone" ? formatPhone(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            toast.error("You must be signed in.");
            router.push("/auth/sign-in?redirectTo=/portal/settings");
            return;
        }

        setSaving(true);

        try {
            const [firstNameRaw, ...rest] = user.name.trim().split(/\s+/);
            const firstName = firstNameRaw || "john";
            const lastName = rest.join(" ") || "smith";

            await updateAccount.mutateAsync({
                firstName,
                lastName,
                schoolEmail: user.email.trim() || null,
                phoneNum: user.phone.trim() || null,
                gradYear: user.graduation ? Number(user.graduation) : null,
                linkedin: user.LinkedIn.trim() || null,
                github: user.GitHub.trim() || null,

                // still persisted even though not shown anymore
                majors: splitList(user.major),
                minors: splitList(user.minor)
            });

            toast.success("Settings updated successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const handleHeadshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!userId) {
            toast.error("You must be signed in.");
            router.push("/auth/sign-in?redirectTo=/portal/settings");
            e.target.value = "";
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file.");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
            setOriginalFile(file);
            setShowCropModal(true);
        };
        reader.readAsDataURL(file);

        // allow selecting the same file again later
        e.target.value = "";
    };

    // --------------------------------------------
    // resume upload (from application page logic)
    // --------------------------------------------
    async function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!userId) {
            toast.error("You must be signed in.");
            router.push("/auth/sign-in?redirectTo=/portal/settings");
            return;
        }

        if (!file.type.includes("pdf")) {
            toast.error("Resume must be a PDF file.");
            e.target.value = "";
            return;
        }

        try {
            await uploadResume.mutateAsync(file);
            await accountQuery.refetch();
            toast.success("Resume uploaded!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload resume");
        } finally {
            e.target.value = "";
        }
    }

    async function handleLogout() {
        try {
            await signOut.mutateAsync();
            window.location.assign("/");
        } catch (err) {
            console.error("[logout] failed", err);
            toast.error("Failed to log out");
        }
    }

    if (loading) {
        return (
            <div
                className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-300">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"/>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // signed out state
    if (!userId) {
        return (
            <div
                className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
                <main className="max-w-4xl mx-auto px-6 py-20">
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You’re not signed in</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Sign in to manage your settings.</p>
                        <div className="flex gap-2">
                            <button
                                onClick={ () => router.push("/auth/sign-in?redirectTo=/portal/settings") }
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                                type="button"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={ () => router.push("/auth/sign-up?redirectTo=/portal/settings") }
                                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                type="button"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const headshotUrl = account?.headshotBlobURL ?? null;
    const resumeUrl = account?.resumeBlobURL ?? null;

    return (
        <div
            className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            <HeadshotCropModal
                open={ showCropModal }
                imageSrc={ imageSrc }
                isDark={ isDark }
                originalFile={ originalFile }
                onCancelAction={ () => {
                    setShowCropModal(false);
                    setImageSrc(null);
                    setOriginalFile(null);
                } }
                onSaveAction={ async (croppedFile) => {
                    if (!userId) {
                        toast.error("You must be signed in.");
                        router.push("/auth/sign-in?redirectTo=/portal/settings");
                        return;
                    }

                    try {
                        await uploadHeadshot.mutateAsync(croppedFile);
                        await accountQuery.refetch();
                        toast.success("Headshot updated successfully!");

                        setShowCropModal(false);
                        setImageSrc(null);
                        setOriginalFile(null);
                    } catch (error) {
                        console.error("Error uploading headshot:", error);
                        toast.error("Failed to upload headshot");
                    }
                } }
            />

            <BackButton/>

            <main className="max-w-4xl mx-auto px-6 py-20">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                        Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                        Manage your account settings and preferences
                    </p>
                </div>

                <form onSubmit={ handleSubmit } className="space-y-6">
                    {/* profile picture section */ }
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile Picture</h2>
                        <div className="flex items-center gap-6">
                            { headshotUrl ? (
                                <Image
                                    src={ headshotUrl }
                                    alt="Profile"
                                    width={ 100 }
                                    height={ 100 }
                                    className="rounded-full border-4 border-blue-200 dark:border-blue-700 object-cover"
                                />
                            ) : (
                                <div
                                    className="h-25 w-25 rounded-full border-4 border-blue-200 dark:border-blue-700 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <User className="h-9 w-9 text-gray-600 dark:text-gray-200"/>
                                </div>
                            ) }

                            <div>
                                <label
                                    htmlFor="headshot"
                                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                                >
                                    { uploadHeadshot.isPending ? "Uploading…" : "Upload New Photo" }
                                </label>
                                <input
                                    id="headshot"
                                    type="file"
                                    accept="image/*"
                                    onChange={ handleHeadshotChange }
                                    className="hidden"
                                    disabled={ uploadHeadshot.isPending }
                                />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">JPG, PNG or GIF</p>
                            </div>
                        </div>
                    </div>

                    {/* resume upload section (new) */ }
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Resume</h2>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            PDF format only. If you don’t have a polished resume, a simple bullet list of jobs,
                            involvement, and projects is okay.
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            <label
                                htmlFor="resume"
                                className={ `inline-block px-4 py-2 rounded-lg text-white transition-colors cursor-pointer ${
                                    uploadResume.isPending ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                                }` }
                            >
                                { uploadResume.isPending
                                    ? "Uploading…"
                                    : resumeUrl
                                        ? "Upload New Resume (PDF)"
                                        : "Upload Resume (PDF)" }
                            </label>

                            <input
                                id="resume"
                                type="file"
                                accept="application/pdf,.pdf"
                                onChange={ handleResumeChange }
                                className="hidden"
                                disabled={ uploadResume.isPending }
                            />

                            { resumeUrl ? (
                                <a
                                    href={ resumeUrl }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline"
                                >
                                    View current resume
                                </a>
                            ) : (
                                <span
                                    className="text-sm text-gray-600 dark:text-gray-400">No resume uploaded yet.</span>
                            ) }
                        </div>
                    </div>

                    {/* personal information */ }
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Personal
                            Information</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={ user.name }
                                    onChange={ handleInputChange }
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={ user.email }
                                    onChange={ handleInputChange }
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    required
                                    placeholder="example@email.sc.edu"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={ user.phone }
                                    onChange={ handleInputChange }
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    placeholder="(123) 456-7890"
                                />
                            </div>

                            <div>
                                <label htmlFor="graduation"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Graduation Year
                                </label>
                                <select
                                    id="graduation"
                                    name="graduation"
                                    value={ user.graduation }
                                    onChange={ handleInputChange }
                                    className="w-full rounded-lg border appearance-none border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                >
                                    <option value="">Select Graduation Year</option>
                                    <option value="2026">2026</option>
                                    <option value="2027">2027</option>
                                    <option value="2028">2028</option>
                                    <option value="2029">2029</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="LinkedIn"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    LinkedIn
                                </label>
                                <input
                                    type="text"
                                    id="LinkedIn"
                                    name="LinkedIn"
                                    value={ user.LinkedIn }
                                    onChange={ handleInputChange }
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>

                            <div>
                                <label htmlFor="GitHub"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    GitHub
                                </label>
                                <input
                                    type="text"
                                    id="GitHub"
                                    name="GitHub"
                                    value={ user.GitHub }
                                    onChange={ handleInputChange }
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    placeholder="https://github.com/username"
                                />
                            </div>
                        </div>
                    </div>

                    {/* account information (non-editable) */ }
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account
                            Information</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Account Type:</span>
                                <span
                                    className="text-gray-900 dark:text-white font-semibold capitalize">{ user.type || "—" }</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Executive Member:</span>
                                <span
                                    className={ `px-3 py-1 rounded-full text-sm font-medium ${
                                        user.exec
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                    }` }
                                >
                                    { user.exec ? "Yes" : "No" }
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">PC Member:</span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                    { user.pc }
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* security */ }
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Security</h2>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={ () => router.push("/login/forgotpassword") }
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={ 2 }
                                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                    />
                                </svg>
                                Change Password
                            </button>

                            <button
                                type="button"
                                onClick={ handleLogout }
                                disabled={ signOut.isPending }
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                { signOut.isPending ? "Logging out…" : "Logout" }
                            </button>
                        </div>
                    </div>

                    {/* action buttons */ }
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={ saving || updateAccount.isPending }
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            { saving || updateAccount.isPending ? "Saving..." : "Save Changes" }
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
