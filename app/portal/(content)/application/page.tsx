// app/portal/application/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

import { useSessionQuery } from "@/client/hooks/auth";
import { useMyAccountQuery } from "@/client/hooks/accounts";
import {
    useMyApplicationQuery,
    useCreateMyApplicationMutation,
    useUpdateMyApplicationMutation,
    useSubmitMyApplicationMutation
} from "@/client/hooks/applications";

type FormState = {
    classification: string;
    major: string;
    minor: string;
    gpa: string;
    linkedin: string;
    github: string;
    reason: string;
};

function formFromApp(app: any | null): FormState {
    return {
        classification: app?.classification ?? "",
        major: app?.major ?? "",
        minor: app?.minor ?? "",
        gpa: app?.gpa != null ? String(app.gpa) : "",
        linkedin: app?.linkedin ?? "",
        github: app?.github ?? "",
        reason: app?.reason ?? ""
    };
}

function parseGpa(raw: string): number | null {
    const v = raw.trim();
    if (!v) return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return NaN;
    return n;
}

export default function PortalApplicationPage() {
    const router = useRouter();

    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    const toggleTheme = () => {
        setIsDark((v) => !v);
        document.documentElement.classList.toggle("dark");
    };

    // sources of truth
    const session = useSessionQuery();
    const userId = session.data?.user?.id ?? null;

    const accountQuery = useMyAccountQuery();
    const account = accountQuery.data ?? null;

    const myAppQuery = useMyApplicationQuery();
    const application = myAppQuery.data ?? null;

    // mutations
    const createMyApp = useCreateMyApplicationMutation();
    const updateMyApp = useUpdateMyApplicationMutation();
    const submitMyApp = useSubmitMyApplicationMutation();

    const loading = session.isFetching || accountQuery.isFetching || myAppQuery.isFetching;

    // local form state (settings-page style)
    const [form, setForm] = useState<FormState>(() => formFromApp(null));
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    // hydrate form from application, but don't clobber in-progress edits
    useEffect(() => {
        if (loading) return;
        if (!dirty) setForm(formFromApp(application));
    }, [loading, application, dirty]);

    const isSubmitted = !!application?.submittedAt;
    const canEdit = !!userId && !isSubmitted && !loading;

    const statusText = useMemo(() => {
        if (loading) return "Loading…";
        if (isSubmitted) return "Submitted";
        if (application) return "Draft";
        return "Not started";
    }, [loading, isSubmitted, application]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDirty(true);
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    function requireIdentityForCreate() {
        const firstName = (account?.firstName ?? "").trim();
        const lastName = (account?.lastName ?? "").trim();
        const fullName = `${ firstName } ${ lastName }`.trim();
        const email = (account?.schoolEmail ?? account?.personalEmail ?? "").trim();

        if (!fullName || !email) {
            toast.error("Please complete your profile (name + email) before saving an application.");
            router.push("/portal/settings");
            return null;
        }

        return { fullName, email };
    }

    function buildPayload() {
        const gpaParsed = parseGpa(form.gpa);

        if (gpaParsed !== null && Number.isNaN(gpaParsed)) {
            toast.error("GPA must be a valid number (e.g., 3.75)");
            return null;
        }
        if (gpaParsed !== null && (gpaParsed < 0 || gpaParsed > 4)) {
            toast.error("GPA must be between 0.0 and 4.0");
            return null;
        }

        return {
            classification: form.classification.trim() || null,
            major: form.major.trim() || null,
            minor: form.minor.trim() || null,
            gpa: gpaParsed,
            linkedin: form.linkedin.trim() || null,
            github: form.github.trim() || null,
            reason: form.reason.trim() || null
        };
    }

    // ✅ create-if-missing OR update-if-existing when saving
    async function saveDraft() {
        if (!userId) {
            toast.error("You must be signed in.");
            router.push("/auth/sign-in?redirectTo=/portal/application");
            return;
        }

        const payload = buildPayload();
        if (!payload) return;

        setSaving(true);
        try {
            if (application) {
                // update existing
                await updateMyApp.mutateAsync(payload);
            } else {
                // create new on first save
                const identity = requireIdentityForCreate();
                if (!identity) return;

                await createMyApp.mutateAsync({
                    ...identity,
                    ...payload
                });
            }

            toast.success("Draft saved.");
            setDirty(false);
            await myAppQuery.refetch();
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to save draft.");
        } finally {
            setSaving(false);
        }
    }

    // submit workflow (still allowed to create-on-submit by saving first, so user isn't blocked)
    async function submitApplication() {
        if (!userId) {
            toast.error("You must be signed in.");
            router.push("/auth/sign-in?redirectTo=/portal/application");
            return;
        }
        if (isSubmitted) return;

        const confirmed = window.confirm("Submit your application now? You will not be able to edit after submitting.");
        if (!confirmed) return;

        setSaving(true);
        try {
            // ensure an application exists + latest fields are persisted
            if (!application || dirty) {
                await saveDraft();
            }

            // after saveDraft, refetch may still be in-flight; ensure we have an app before submit
            const fresh = await myAppQuery.refetch();
            const nowApp = (fresh.data ?? null) as any | null;
            if (!nowApp) {
                toast.error("Please save your application before submitting.");
                return;
            }

            await submitMyApp.mutateAsync();

            toast.success("Application submitted!");
            setDirty(false);
            await myAppQuery.refetch();
        } catch (e: any) {
            toast.error(e?.message ?? "Submit failed.");
        } finally {
            setSaving(false);
        }
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

    if (!userId) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
                <ThemeToggle/>
                <main className="max-w-4xl mx-auto px-6 py-20">
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You’re not signed in</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Sign in to complete your application.</p>
                        <div className="flex gap-2">
                            <button
                                onClick={ () => router.push("/auth/sign-in?redirectTo=/portal/application") }
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                                type="button"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={ () => router.push("/auth/sign-up?redirectTo=/portal/application") }
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

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            <ThemeToggle/>

            {/* theme toggle */ }
            <button
                onClick={ toggleTheme }
                className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-gray-700"
                aria-label="Toggle theme"
                type="button"
            >
                { isDark ? (
                    <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={ 2 }
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={ 2 }
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                    </svg>
                ) }
            </button>

            {/* back button */ }
            <button
                onClick={ () => router.back() }
                className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium text-sm"
                type="button"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 }
                          d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Back
            </button>

            <main className="max-w-4xl mx-auto px-6 py-20">
                <div className="mb-8">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                                Application
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                Enter your information, save drafts, then submit when ready.
                            </p>
                        </div>

                        <div className="shrink-0 text-right">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
                            <div
                                className={ `inline-flex mt-1 px-3 py-1 rounded-full text-sm font-medium border ${
                                    isSubmitted
                                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                                        : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                                }` }
                            >
                                { statusText }
                            </div>
                        </div>
                    </div>
                </div>

                {/* actions */ }
                <div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300 mb-6">
                    <div className="flex flex-wrap gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={ saveDraft }
                            disabled={ !canEdit || saving || createMyApp.isPending || updateMyApp.isPending }
                        >
                            { saving || createMyApp.isPending || updateMyApp.isPending ? "Saving…" : "Save Draft" }
                        </Button>

                        <Button
                            type="button"
                            onClick={ submitApplication }
                            disabled={ isSubmitted || saving || submitMyApp.isPending }
                        >
                            { saving || submitMyApp.isPending ? "Submitting…" : "Submit" }
                        </Button>
                    </div>

                    { !application && !isSubmitted ? (
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                            You haven’t saved an application yet. Fill out the form and click <span
                            className="font-medium">Save Draft</span> to create it.
                        </p>
                    ) : null }

                    { isSubmitted ? (
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Submitted applications are
                            read-only.</p>
                    ) : null }
                </div>

                {/* form (settings-like) */ }
                <div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Application Details</h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="classification"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Classification
                            </label>
                            <input
                                id="classification"
                                name="classification"
                                value={ form.classification }
                                onChange={ handleInputChange }
                                disabled={ !canEdit }
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="Freshman, Sophomore, Junior, Senior"
                            />
                        </div>

                        <div>
                            <label htmlFor="gpa"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                GPA
                            </label>
                            <input
                                id="gpa"
                                name="gpa"
                                value={ form.gpa }
                                onChange={ handleInputChange }
                                disabled={ !canEdit }
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="3.75"
                            />
                        </div>

                        <div>
                            <label htmlFor="major"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Major
                            </label>
                            <input
                                id="major"
                                name="major"
                                value={ form.major }
                                onChange={ handleInputChange }
                                disabled={ !canEdit }
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="IIT, CS, etc."
                            />
                        </div>

                        <div>
                            <label htmlFor="minor"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Minor
                            </label>
                            <input
                                id="minor"
                                name="minor"
                                value={ form.minor }
                                onChange={ handleInputChange }
                                disabled={ !canEdit }
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="Business, Math, etc."
                            />
                        </div>

                        <div>
                            <label htmlFor="linkedin"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                LinkedIn
                            </label>
                            <input
                                id="linkedin"
                                name="linkedin"
                                value={ form.linkedin }
                                onChange={ handleInputChange }
                                disabled={ !canEdit }
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="https://www.linkedin.com/in/username"
                            />
                        </div>

                        <div>
                            <label htmlFor="github"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                GitHub
                            </label>
                            <input
                                id="github"
                                name="github"
                                value={ form.github }
                                onChange={ handleInputChange }
                                disabled={ !canEdit }
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="https://github.com/username"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="reason"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Why do you want to join?
                            </label>
                            <textarea
                                id="reason"
                                name="reason"
                                value={ form.reason }
                                onChange={ handleInputChange }
                                disabled={ !canEdit }
                                rows={ 6 }
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="Write a thoughtful response…"
                            />
                        </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">Events attended:</span>{ " " }
                        { (application?.eventsAttended?.length ?? 0) > 0 ? (
                            <span className="inline-flex flex-wrap gap-2 ml-2">
                                  { application!.eventsAttended.map((evt: string) => (
                                      <span
                                          key={ evt }
                                          className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                                      >
                                      { evt }
                                    </span>
                                  )) }
                                </span>
                        ) : (
                            <span className="ml-2">No events recorded yet.</span>
                        ) }
                    </div>
                </div>
            </main>
        </div>
    );
}
