// app/portal/application/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { User } from "lucide-react";
import Cropper from "react-easy-crop";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useSessionQuery } from "@/client/hooks/auth";
import {
    useMyAccountQuery,
    useUpdateMyAccountMutation,
    useUploadHeadshotMutation,
    useUploadResumeMutation
} from "@/client/hooks/accounts";
import {
    useCreateMyApplicationMutation,
    useMyApplicationQuery,
    useSubmitMyApplicationMutation,
    useUpdateMyApplicationMutation
} from "@/client/hooks/applications";

interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

type FormState = {
    // account-routed
    phoneNum: string;
    hometown: string;
    linkedin: string;
    github: string;

    // read-only identity (still shown, but greyed out)
    fullName: string;
    email: string;

    // application-routed (plus old-page fields)
    preferredFirstName: string;
    classification: string;
    major: string;
    minor: string;
    gpa: string;
    circumstance: string;
    reason: string;

    // read-only (from db: applications.eventsAttended)
    rushEvents: string[];

    affirmation: boolean;
};

const RUSH_EVENT_LABELS: Record<string, string> = {
    "info-night": "Info Night",
    "field-day": "Field Day",
    "technical-workshop": "Technical Workshop",
    "pitch-night": "Pitch Night"
};

function normalizeString(v: unknown): string {
    if (typeof v !== "string") return "";
    return v.trim();
}

function isValidScEduEmail(email: string): boolean {
    const emailLower = email.toLowerCase();
    if (!emailLower.includes("@")) return false;
    const domain = emailLower.split("@")[1] ?? "";
    return domain.endsWith("sc.edu");
}

function prettyRushEvent(raw: string): string {
    const v = normalizeString(raw);
    if (!v) return "Unknown";
    if (RUSH_EVENT_LABELS[v]) return RUSH_EVENT_LABELS[v];

    return v
        .replace(/[_-]+/g, " ")
        .trim()
        .split(/\s+/)
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ");
}

function formFromSources(app: any | null, account: any | null): FormState {
    const firstName = normalizeString(account?.firstName);
    const lastName = normalizeString(account?.lastName);
    const accountName = normalizeString(`${ firstName } ${ lastName }`.trim());

    const accountEmail = normalizeString(account?.schoolEmail) || normalizeString(account?.personalEmail);

    const displayName = normalizeString(app?.fullName) || accountName;
    const displayEmail = normalizeString(app?.email) || accountEmail;

    return {
        // account
        phoneNum: normalizeString(account?.phoneNum),
        hometown: normalizeString(account?.hometown),
        linkedin: normalizeString(account?.linkedin),
        github: normalizeString(account?.github),

        // identity
        fullName: displayName,
        email: displayEmail,

        // application
        preferredFirstName: normalizeString(app?.preferredFirstName) || normalizeString(app?.preferred_first_name),
        classification: normalizeString(app?.classification),
        major: normalizeString(app?.major),
        minor: normalizeString(app?.minor),
        gpa: app?.gpa != null ? String(app.gpa) : "",
        circumstance: normalizeString(app?.circumstance),
        reason: normalizeString(app?.reason),

        // read-only from db
        rushEvents: Array.isArray(app?.eventsAttended) ? (app.eventsAttended as string[]) : [],

        affirmation: false
    };
}

function parseGpa(raw: string): number | null {
    const v = raw.trim();
    if (!v) return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return NaN;
    return n;
}

function getIdentityForCreate(account: any | null) {
    const firstName = normalizeString(account?.firstName);
    const lastName = normalizeString(account?.lastName);
    const fullName = normalizeString(`${ firstName } ${ lastName }`.trim());
    const email = normalizeString(account?.schoolEmail) || normalizeString(account?.personalEmail);

    if (!fullName || !email) return null;
    return { fullName, email };
}

async function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.addEventListener("load", () => resolve(img));
        img.addEventListener("error", (err) => reject(err));
        img.setAttribute("crossOrigin", "anonymous");
        img.src = url;
    });
}

async function getCroppedImg(imageSrc: string, pixelCrop: PixelCrop): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob as Blob), "image/jpeg");
    });
}

export default function PortalApplicationPage() {
    const router = useRouter();

    // sources of truth
    const session = useSessionQuery();
    const userId = session.data?.user?.id ?? null;

    const accountQuery = useMyAccountQuery();
    const account = accountQuery.data ?? null;

    const myAppQuery = useMyApplicationQuery();
    const application = myAppQuery.data ?? null;

    // mutations
    const updateMyAccount = useUpdateMyAccountMutation();
    const uploadHeadshot = useUploadHeadshotMutation();
    const uploadResume = useUploadResumeMutation();

    const createMyApp = useCreateMyApplicationMutation();
    const updateMyApp = useUpdateMyApplicationMutation();
    const submitMyApp = useSubmitMyApplicationMutation();

    const loading = session.isFetching || accountQuery.isFetching || myAppQuery.isFetching;

    // local form state
    const [form, setForm] = useState<FormState>(() => formFromSources(null, null));
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    // hydrate form from application + account, but don't clobber in-progress edits
    useEffect(() => {
        if (loading) return;
        if (!dirty) setForm(formFromSources(application, account));
    }, [loading, application, account, dirty]);

    const isSubmitted = !!application?.submittedAt;
    const canEdit = !!userId && !isSubmitted && !loading;

    const statusText = useMemo(() => {
        if (loading) return "Loading…";
        if (isSubmitted) return "Submitted";
        if (application) return "Draft";
        return "Not started";
    }, [loading, isSubmitted, application]);

    const headshotUrl = account?.headshotBlobURL ?? null;
    const resumeUrl = account?.resumeBlobURL ?? null;

    function formatPhone(value: string) {
        const digits = value.replace(/\D/g, "").slice(0, 10);

        const parts = [];
        if (digits.length > 0) parts.push("(" + digits.slice(0, 3));
        if (digits.length >= 4) parts.push(") " + digits.slice(3, 6));
        if (digits.length >= 7) parts.push("-" + digits.slice(6, 10));

        return parts.join("");
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDirty(true);
        setForm((prev) => ({
            ...prev,
            [name]: name === "phoneNum" ? formatPhone(value) : value
        }));
    };

    function buildAccountPatchPayload() {
        return {
            phoneNum: form.phoneNum.trim() || null,
            hometown: form.hometown.trim() || null,
            linkedin: form.linkedin.trim() || null,
            github: form.github.trim() || null
        };
    }

    function buildApplicationPayload() {
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
            reason: form.reason.trim() || null,

            preferredFirstName: form.preferredFirstName.trim() || null,
            circumstance: form.circumstance.trim() || null,
            linkedin: form.linkedin.trim() || null,
            github: form.github.trim() || null,

            // keep application.resumeUrl in sync with uploaded resume
            resumeUrl: (account?.resumeBlobURL ?? null) as string | null
        };
    }

    async function saveDraft() {
        if (!userId) {
            toast.error("You must be signed in.");
            router.push("/auth/sign-in?redirectTo=/portal/application");
            return;
        }

        const appPayload = buildApplicationPayload();
        if (!appPayload) return;

        setSaving(true);
        try {
            // 1) account fields -> accounts
            await updateMyAccount.mutateAsync(buildAccountPatchPayload());
            await accountQuery.refetch();

            // 2) application fields -> applications (create on first save)
            if (application) {
                await updateMyApp.mutateAsync(appPayload);
            } else {
                const identity = getIdentityForCreate(account);
                if (!identity) {
                    toast.error("Please complete your profile (name + email) before saving an application.");
                    router.push("/portal/settings");
                    return;
                }

                await createMyApp.mutateAsync({
                    ...identity,
                    ...appPayload
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

    async function submitApplication() {
        if (!userId) {
            toast.error("You must be signed in.");
            router.push("/auth/sign-in?redirectTo=/portal/application");
            return;
        }
        if (isSubmitted) return;

        if (!isValidScEduEmail(form.email)) {
            toast.error("Please use a valid USC email address.");
            router.push("/portal/settings");
            return;
        }

        // required checks
        if (!headshotUrl) {
            toast.error("Please upload a picture before submitting.");
            return;
        }
        if (!resumeUrl) {
            toast.error("Please upload a resume (PDF) before submitting.");
            return;
        }
        if (!form.phoneNum.trim()) {
            toast.error("Please add a phone number before submitting.");
            return;
        }
        if (!form.classification.trim()) {
            toast.error("Please select your year in school before submitting.");
            return;
        }
        if (!form.gpa.trim()) {
            toast.error("Please enter your GPA before submitting.");
            return;
        }
        if (!form.major.trim()) {
            toast.error("Please enter your major(s) before submitting.");
            return;
        }
        if (!form.reason.trim()) {
            toast.error("Please complete “Why KTP” before submitting.");
            return;
        }

        const numericGPA = Number(form.gpa)

        if (!form.circumstance.trim() && numericGPA < 3.0) {
            toast.error("Please complete the Extenuating Circumstances section before submitting.");
            return;
        }

        const words = form.reason.trim().split(/\s+/).filter(Boolean);
        if (words.length > 150) {
            toast.error(`Your "Why KTP" response is ${ words.length } words. Please keep it under 150 words.`);
            return;
        }

        if (!form.affirmation) {
            toast.error("Please affirm the application is complete and correct.");
            return;
        }

        const confirmed = window.confirm("Submit your application now? You will not be able to edit after submitting.");
        if (!confirmed) return;

        setSaving(true);
        try {
            // ensure latest edits persisted
            if (!application || dirty) {
                await saveDraft();
            }

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

    // --------------------------------------------
    // headshot upload with REQUIRED square cropping
    // --------------------------------------------
    const headshotInputRef = React.useRef<HTMLInputElement | null>(null);

    const [showHeadshotCropper, setShowHeadshotCropper] = React.useState(false);
    const [headshotPreview, setHeadshotPreview] = React.useState<string | null>(null);
    const [headshotOriginalFile, setHeadshotOriginalFile] = React.useState<File | null>(null);

    const [headshotCrop, setHeadshotCrop] = React.useState({ x: 0, y: 0 });
    const [headshotZoom, setHeadshotZoom] = React.useState(1);
    const [headshotCroppedAreaPixels, setHeadshotCroppedAreaPixels] = React.useState<PixelCrop | null>(null);

    useEffect(() => {
        return () => {
            if (headshotPreview) URL.revokeObjectURL(headshotPreview);
        };
    }, [headshotPreview]);

    function handleGpaBlur() {
        const raw = form.gpa.trim();
        if (!raw) return;

        const num = Number(raw);
        if (!Number.isFinite(num)) return;

        setForm((prev) => ({
            ...prev,
            gpa: num.toFixed(2)
        }));
    }

    function triggerHeadshotSelect() {
        headshotInputRef.current?.click();
    }

    const onHeadshotCropComplete = (_croppedArea: unknown, croppedAreaPixels: PixelCrop) => {
        setHeadshotCroppedAreaPixels(croppedAreaPixels);
    };

    function clearHeadshotCropState() {
        if (headshotInputRef.current) headshotInputRef.current.value = "";
        if (headshotPreview) URL.revokeObjectURL(headshotPreview);

        setShowHeadshotCropper(false);
        setHeadshotPreview(null);
        setHeadshotOriginalFile(null);
        setHeadshotCrop({ x: 0, y: 0 });
        setHeadshotZoom(1);
        setHeadshotCroppedAreaPixels(null);
    }

    async function handleHeadshotChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!userId) {
            toast.error("You must be signed in.");
            router.push("/auth/sign-in?redirectTo=/portal/application");
            e.target.value = "";
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Picture must be an image file.");
            e.target.value = "";
            return;
        }

        // clear input so selecting the same file again still triggers onChange
        e.target.value = "";

        // open cropper (no direct upload allowed)
        const url = URL.createObjectURL(file);
        setHeadshotOriginalFile(file);
        setHeadshotPreview(url);
        setShowHeadshotCropper(true);
        setHeadshotCrop({ x: 0, y: 0 });
        setHeadshotZoom(1);
        setHeadshotCroppedAreaPixels(null);
    }

    async function handleSaveHeadshotCropAndUpload() {
        try {
            if (!userId) {
                toast.error("You must be signed in.");
                router.push("/auth/sign-in?redirectTo=/portal/application");
                return;
            }

            if (!headshotPreview || !headshotCroppedAreaPixels || !headshotOriginalFile) {
                toast.error("Please crop your photo before uploading.");
                return;
            }

            const croppedBlob = await getCroppedImg(headshotPreview, headshotCroppedAreaPixels);

            // enforce square output (cropper is 1:1, but guard anyway)
            if (headshotCroppedAreaPixels.width !== headshotCroppedAreaPixels.height) {
                toast.error("Headshots must be square. Please adjust your crop.");
                return;
            }

            const croppedFile = new File([croppedBlob], headshotOriginalFile.name, { type: "image/jpeg" });

            await uploadHeadshot.mutateAsync(croppedFile);
            await accountQuery.refetch();

            toast.success("Profile picture updated!");
            clearHeadshotCropState();
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload profile picture");
        }
    }

    // --------------------------------------------
    // resume upload
    // --------------------------------------------
    async function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!userId) {
            toast.error("You must be signed in.");
            router.push("/auth/sign-in?redirectTo=/portal/application");
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

    if (!userId) {
        return (
            <div
                className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
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
            className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            <main className="max-w-4xl mx-auto px-6 py-20">
                {/* header */ }
                <div className="mb-8">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                                Rush Application
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                Save drafts as you go, then submit when ready.
                            </p>
                        </div>

                        <div className="shrink-0 text-right">
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

                {/* intro + due card */ }
                <div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300 mb-6">
                    <div className="space-y-3 text-gray-900 dark:text-gray-100">
                        <p>Thank you for your interest in becoming a member of Kappa Theta Pi!</p>
                        <p>
                            Kappa Theta Pi is a Professional Co-Ed Technology Fraternity founded in 2012, aiming to
                            develop a talented slate of
                            future computing professionals. The Alpha Theta Chapter at the University of South Carolina
                            welcomes you to its second
                            recruitment cycle for its Beta class.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            If you have any questions, please reach out to the executive board at{ " " }
                            <a href="mailto:soktp@mailbox.sc.edu"
                               className="text-blue-600 dark:text-blue-400 underline hover:no-underline">
                                soktp@mailbox.sc.edu
                            </a>
                            . <em>Please note that this application will not save your progress unless you click “Save
                            Draft.”</em>
                        </p>
                        <p>
                            <strong>
                                Incomplete applications will not be accepted. To verify your application is complete,
                                check for the status "Under Review" in your portal home page once you submit.
                            </strong>
                        </p>
                    </div>

                    <div
                        className="mt-5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#315CA9] shrink-0" fill="none" stroke="currentColor"
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 }
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            This application is due{ " " }
                            <a
                                href="https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MG5qaDU2c3M0b3A5a2lucTMxZGtiM2FzZ2IgMWIyMDM0Mzc1MWQwMTMwNzRlNWY1ZjgyYmZjYjcwYTljZjRmZmJhN2E1YTU5ZDkzYzkyZjNiMjg5NGY3ZWY2NkBn&tmsrc=1b20343751d013074e5f5f82bfcb70a9cf4ffba7a5a59d93c92f3b2894f7ef66%40group.calendar.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#315CA9] underline hover:text-[#003166]"
                            >
                                Friday, January 30th, 9 PM EST
                            </a>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">&emsp;&emsp;We will not
                            accept responses after this time.</p>
                    </div>
                </div>

                {/* uploads */ }
                <div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Uploads</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* profile picture */ }
                        <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Upload Picture <span className="text-red-500">*</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                Upload an image file with your face, clearly visible. The purpose of this is to allow us
                                to put a face to your name.
                            </p>

                            <div className="flex items-center gap-4">
                                { headshotUrl ? (
                                    <Image
                                        src={ headshotUrl }
                                        alt="Profile"
                                        width={ 96 }
                                        height={ 96 }
                                        className="rounded-full border-4 border-blue-200 dark:border-blue-700 object-cover"
                                    />
                                ) : (
                                    <div
                                        className="h-24 w-24 rounded-full border-4 border-blue-200 dark:border-blue-700 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <User className="h-9 w-9 text-gray-600 dark:text-gray-200"/>
                                    </div>
                                ) }

                                <div className="flex flex-col gap-2">
                                    <input
                                        ref={ headshotInputRef }
                                        id="headshot"
                                        type="file"
                                        accept="image/*"
                                        onChange={ handleHeadshotChange }
                                        className="hidden"
                                        disabled={ !canEdit || uploadHeadshot.isPending }
                                    />

                                    <Button
                                        type="button"
                                        onClick={ triggerHeadshotSelect }
                                        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                                        disabled={ !canEdit || uploadHeadshot.isPending }
                                    >
                                        Upload Picture
                                    </Button>

                                    <p className="text-xs text-gray-500 dark:text-gray-400">JPG/PNG recommended.</p>
                                </div>
                            </div>

                            {/* crop UI (required) */ }
                            { showHeadshotCropper && headshotPreview ? (
                                <div
                                    className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
                                    <div className="mb-4">
                                        <label
                                            className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                                            Zoom: { (headshotZoom * 100).toFixed(0) }%
                                        </label>
                                        <input
                                            type="range"
                                            min={ 1 }
                                            max={ 3 }
                                            step={ 0.1 }
                                            value={ headshotZoom }
                                            onChange={ (e) => setHeadshotZoom(Number(e.target.value)) }
                                            className="w-full"
                                            disabled={ uploadHeadshot.isPending }
                                        />
                                    </div>

                                    <div className="relative w-full h-64 bg-gray-900 rounded-md overflow-hidden mb-4">
                                        <Cropper
                                            image={ headshotPreview }
                                            crop={ headshotCrop }
                                            zoom={ headshotZoom }
                                            aspect={ 1 }
                                            showGrid
                                            onCropChange={ setHeadshotCrop }
                                            onCropComplete={ onHeadshotCropComplete }
                                            onZoomChange={ setHeadshotZoom }
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            onClick={ handleSaveHeadshotCropAndUpload }
                                            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                                            disabled={ !canEdit || uploadHeadshot.isPending }
                                        >
                                            { uploadHeadshot.isPending ? "Uploading…" : "Save Crop & Upload" }
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={ clearHeadshotCropState }
                                            className="cursor-pointer text-red-600 hover:text-red-700"
                                            disabled={ uploadHeadshot.isPending }
                                        >
                                            Cancel
                                        </Button>
                                    </div>

                                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                        Headshots must be square. Crop and upload to continue.
                                    </p>
                                </div>
                            ) : null }
                        </div>

                        {/* resume */ }
                        <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Upload Resume/CV <span className="text-red-500">*</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
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
                                        : (resumeUrl ? "Upload New Resume (PDF)" : "Upload Resume (PDF)")
                                    }
                                </label>
                                <input
                                    id="resume"
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    onChange={ handleResumeChange }
                                    className="hidden"
                                    disabled={ !canEdit || uploadResume.isPending }
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
                    </div>
                </div>

                {/* identity (read-only) */ }
                <div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Identity</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={ form.fullName }
                                disabled
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                            />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">To change this, update your
                                profile settings.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                USC Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={ form.email }
                                disabled
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                            />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Please ensure this is correct. Interview communications will be sent via email.
                            </p>
                        </div>
                    </div>
                </div>

                {/* profile overrides (account-routed) */ }
                <div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Profile Overrides</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        These fields save to your <span className="font-medium">Account</span> and will show across the
                        portal.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="phoneNum"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="phoneNum"
                                name="phoneNum"
                                value={ form.phoneNum }
                                onChange={ handleInputChange }
                                disabled={ !canEdit }
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="(555) 123-4567"
                            />
                        </div>

                        <div>
                            <label htmlFor="hometown"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Hometown
                            </label>
                            <input
                                id="hometown"
                                name="hometown"
                                value={ form.hometown }
                                onChange={ handleInputChange }
                                disabled={ !canEdit }
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="City, State"
                            />
                        </div>

                        <div>
                            <label htmlFor="linkedin"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                LinkedIn (optional)
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
                                GitHub (optional)
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
                    </div>
                </div>

                {/* application details (application-routed) */ }
                <div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Application Details</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        These fields save to your <span className="font-medium">Application</span> draft.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* preferred first name */ }
                        <div>
                            <label htmlFor="preferredFirstName"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Preferred First Name
                            </label>
                            <input
                                id="preferredFirstName"
                                name="preferredFirstName"
                                value={ form.preferredFirstName }
                                onChange={ handleInputChange }
                                disabled={ !canEdit }
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="Optional"
                            />
                        </div>

                        {/* year in school */ }
                        <div>
                            <label htmlFor="classification"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Year in School <span className="text-red-500">*</span>
                            </label>

                            <Select
                                value={ form.classification || undefined }
                                onValueChange={ (v) => {
                                    setDirty(true);
                                    setForm((prev) => ({ ...prev, classification: v }));
                                } }
                                disabled={ !canEdit }
                            >
                                <SelectTrigger
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                                    <SelectValue placeholder="None Selected"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Freshman">Freshman</SelectItem>
                                    <SelectItem value="Sophomore">Sophomore</SelectItem>
                                    <SelectItem value="Junior">Junior</SelectItem>
                                    <SelectItem value="Senior">Senior</SelectItem>
                                </SelectContent>
                            </Select>

                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Not by credit hours. “Freshman” means first-year in university.
                            </p>
                        </div>

                        {/* gpa */ }
                        <div>
                            <label htmlFor="gpa"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                GPA <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="gpa"
                                name="gpa"
                                value={ form.gpa }
                                onChange={ handleInputChange }
                                onBlur={ handleGpaBlur }
                                disabled={ !canEdit }
                                inputMode="decimal"
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="e.g., 3.75"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                KTP expects a minimum 3.00 GPA; anyone interested is welcome to apply.
                            </p>
                        </div>

                        {/* major */ }
                        <div>
                            <label htmlFor="major"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Major(s) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="major"
                                name="major"
                                value={ form.major }
                                onChange={ handleInputChange }
                                disabled={ !canEdit }
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="IIT, CE, CS, etc."
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">KTP accepts all majors.</p>
                        </div>

                        {/* minor */ }
                        <div>
                            <label htmlFor="minor"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Minor(s)
                            </label>
                            <input
                                id="minor"
                                name="minor"
                                value={ form.minor }
                                onChange={ handleInputChange }
                                disabled={ !canEdit }
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="optional"
                            />
                        </div>

                        {/* extenuating */ }
                        <div className="md:col-span-2">
                            <label htmlFor="circumstance"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Extenuating Circumstances
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                If your GPA is below a 3.00, explain any extenuating circumstances or hardships you’d
                                like us to consider.
                            </p>
                            <textarea
                                id="circumstance"
                                name="circumstance"
                                value={ form.circumstance }
                                onChange={ handleInputChange }
                                disabled={ !canEdit }
                                rows={ 4 }
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="Enter text here"
                            />
                        </div>

                        {/* why ktp */ }
                        <div className="md:col-span-2">
                            <label htmlFor="reason"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Why are you interested in joining Kappa Theta Pi? What talents/experiences could you
                                bring to the organization?{ " " }
                                <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Answer in less than 150
                                words.</p>
                            <textarea
                                id="reason"
                                name="reason"
                                value={ form.reason }
                                onChange={ handleInputChange }
                                disabled={ !canEdit }
                                rows={ 6 }
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="Note: this application will not save your progress unless you click “Save Draft.”"
                            />
                        </div>

                        {/* rush events (read-only) */ }
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Rush events recorded <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                This section is <span className="font-medium">read-only</span>. It shows the rush events
                                currently recorded on your
                                application.
                            </p>

                            { form.rushEvents.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    { form.rushEvents.map((ev, idx) => (
                                        <span
                                            key={ `${ ev }-${ idx }` }
                                            className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-1 text-sm text-gray-900 dark:text-gray-100"
                                        >
                                            { prettyRushEvent(ev) }
                                        </span>
                                    )) }
                                </div>
                            ) : (
                                <div
                                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">No rush events have been
                                        recorded yet.</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        If you haven’t attended an event yet, check the Rush page for the schedule and
                                        make sure you get checked in.
                                    </p>
                                </div>
                            ) }
                        </div>

                        {/* affirmation */ }
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                I affirm this application is complete and correct to the best of my knowledge. <span
                                className="text-red-500">*</span>
                            </label>
                            <div className={ `flex items-center gap-3 ${ !canEdit ? "opacity-60" : "" }` }>
                                <input
                                    id="affirmation"
                                    type="checkbox"
                                    checked={ form.affirmation }
                                    onChange={ (e) => {
                                        setDirty(true);
                                        setForm((prev) => ({ ...prev, affirmation: e.target.checked }));
                                    } }
                                    disabled={ !canEdit }
                                    className="h-4 w-4 rounded border"
                                />
                                <label htmlFor="affirmation" className="text-sm text-gray-900 dark:text-gray-100">
                                    Yes
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 text-xs text-gray-500 dark:text-gray-400">
                        Tip: Click <span className="font-medium">Save Draft</span> frequently. Submitting locks your
                        application.
                    </div>
                </div>

                {/* actions (bottom) */ }
                <div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300 mt-6">
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={ saveDraft }
                            className="cursor-pointer flex-1"
                            disabled={ !canEdit || saving || createMyApp.isPending || updateMyApp.isPending || updateMyAccount.isPending }
                        >
                            { saving || createMyApp.isPending || updateMyApp.isPending || updateMyAccount.isPending ? "Saving…" : "Save Draft" }
                        </Button>

                        <Button
                            type="button"
                            onClick={ submitApplication }
                            className="cursor-pointer flex-1"
                            disabled={ isSubmitted || saving || submitMyApp.isPending }
                        >
                            { saving || submitMyApp.isPending ? "Submitting…" : "Submit" }
                        </Button>
                    </div>

                    { !application && !isSubmitted ? (
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                            You haven’t saved an application yet. Fill out the form and click <span
                            className="font-medium">Save Draft</span> to
                            create it.
                        </p>
                    ) : null }

                    { isSubmitted ?
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Submitted applications are
                            read-only.</p> : null }
                </div>
            </main>
        </div>
    );
}
