// app/settings/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { authClient } from "@/lib/auth/client";
import ThemeToggle from "@/components/ThemeToggle";

import { useSessionQuery } from "@/hooks/useSessionQuery";
import { usePortalUserQuery } from "@/hooks/usePortalUserQuery";
import { useHeadshotQuery } from "@/hooks/useHeadshotQuery";

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
    const qc = useQueryClient();

    const handleHomeClick = () => {
        document.documentElement.classList.remove("dark");
        router.push("/");
    };

    const [saving, setSaving] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const { data: sessionData, isFetching: sessionFetching } = useSessionQuery();
    const userId = sessionData?.user?.id ?? null;

    const { data: portalUserData, isFetching: portalUserFetching } = usePortalUserQuery(userId);
    const account = portalUserData ?? null;

    const { data: headshotData } = useHeadshotQuery(userId);
    const headshotUrl = headshotData?.headshotBlobURL ?? account?.headshotBlobURL ?? null;

    const loading = sessionFetching || portalUserFetching;

    const [user, setUser] = useState({
        name: "",
        email: "",
        phone: "",
        graduation: "",
        headshot: "",
        LinkedIn: "",
        bio: "",
        type: "",
        exec: false,
        pc: false,

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

        setUser((prev) => ({
            ...prev,
            name: fullName,
            email: account.schoolEmail ?? account.personalEmail ?? "",
            phone: account.phoneNum ?? "",
            graduation: account.gradYear != null ? String(account.gradYear) : "",
            headshot: headshotUrl ?? "",
            LinkedIn: account.linkedin ?? "",
            bio: prev.bio ?? "",
            type: account.type ?? "",
            exec: account.type === "LEADERSHIP",
            pc: false,

            // still hydrate but not displayed
            major: joinList(account.majors),
            minor: joinList(account.minors),
            gpa: ""
        }));
    }, [account, headshotUrl]);

    const toggleTheme = () => {
        setIsDark((v) => !v);
        document.documentElement.classList.toggle("dark");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) {
            toast.error("You must be signed in.");
            return;
        }

        setSaving(true);

        try {
            const [firstName, ...rest] = user.name.trim().split(/\s+/);
            const lastName = rest.join(" ");

            const response = await fetch(`/api/accounts/${ userId }`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                cache: "no-store",
                body: JSON.stringify({
                    firstName: firstName || "john",
                    lastName: lastName || "smith",
                    schoolEmail: user.email.trim() || null,
                    phoneNum: user.phone.trim() || null,
                    gradYear: user.graduation ? Number(user.graduation) : null,
                    linkedin: user.LinkedIn.trim() || null,

                    // still persisted even though not shown anymore
                    majors: splitList(user.major),
                    minors: splitList(user.minor)
                })
            });

            if (!response.ok) {
                const body = await response.json().catch(() => null);
                throw new Error(body?.error ?? "Failed to save changes");
            }

            toast.success("Settings updated successfully!");
            await qc.invalidateQueries({ queryKey: ["portalUser", userId] });
            await qc.invalidateQueries({ queryKey: ["headshot", userId] });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const handleHeadshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        const formData = new FormData();
        formData.append("headshot", file);

        try {
            const response = await fetch(`/api/accounts/${ userId }/headshot`, {
                method: "POST",
                credentials: "include",
                body: formData
            });

            if (!response.ok) {
                const body = await response.json().catch(() => null);
                throw new Error(body?.error ?? "Failed to upload headshot");
            }

            toast.success("Headshot updated successfully!");
            await qc.invalidateQueries({ queryKey: ["headshot", userId] });
            await qc.invalidateQueries({ queryKey: ["portalUser", userId] });
        } catch (error) {
            console.error("Error uploading headshot:", error);
            toast.error("Failed to upload headshot");
        } finally {
            e.target.value = "";
        }
    };

    async function handleLogout() {
        await authClient.signOut({ fetchOptions: { throw: false } });
        window.location.href = "/";
    }

    if (loading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-300">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"/>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            <ThemeToggle/>

            {/* theme toggle (unchanged) */ }
            <button
                onClick={ toggleTheme }
                className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-gray-700"
                aria-label="Toggle theme"
                type="button"
            >
                { isDark ? (
                    <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 }
                              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 }
                              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                ) }
            </button>

            {/* back button (unchanged) */ }
            <button
                onClick={() => router.back()}
                className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium text-sm"
                type="button"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
            </button>

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
                                    className="h-[100px] w-[100px] rounded-full border-4 border-blue-200 dark:border-blue-700 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <User className="h-9 w-9 text-gray-600 dark:text-gray-200"/>
                                </div>
                            ) }

                            <div>
                                <label
                                    htmlFor="headshot"
                                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                                >
                                    Upload New Photo
                                </label>
                                <input
                                    id="headshot"
                                    type="file"
                                    accept="image/*"
                                    onChange={ handleHeadshotChange }
                                    className="hidden"
                                />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">JPG, PNG or GIF</p>
                            </div>
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
                                />
                            </div>

                            <div>
                                <label htmlFor="bio"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Bio
                                </label>
                                <input
                                    type="text"
                                    id="bio"
                                    name="bio"
                                    value={ user.bio }
                                    onChange={ handleInputChange }
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
                                <span
                                    className={ `px-3 py-1 rounded-full text-sm font-medium ${
                                        user.pc
                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                    }` }
                                >
                                    { user.pc ? "Yes" : "No" }
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 }
                                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                                </svg>
                                Change Password
                            </button>

                            <button
                                type="button"
                                onClick={ handleLogout }
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* action buttons */ }
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={ saving }
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            { saving ? "Saving..." : "Save Changes" }
                        </button>
                        <button
                            type="button"
                            onClick={ () => router.push("/homepage") }
                            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                <button onClick={ handleHomeClick } className="hidden" type="button">
                    home
                </button>
            </main>
        </div>
    );
}
