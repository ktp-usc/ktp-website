// app/(site)/profile/ProfileForm.tsx
"use client";

import React, { useActionState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import Cropper, { Area } from "react-easy-crop";

import type { accounts } from "@prisma/client";
import { updateProfile } from "./actions";

type ActionState = { error?: string; success?: string } | null;

function toCommaList(arr: string[]) {
    return (arr ?? []).join(", ");
}

export default function ProfileForm({
                                        initialAccount,
                                        embedded = false
                                    }: {
    initialAccount: accounts;
    embedded?: boolean;
}) {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState<ActionState, FormData>(updateProfile, null);

    // local form state (so fields feel snappy and you can preview headshot)
    const [form, setForm] = React.useState(() => ({
        firstName: initialAccount.firstName ?? "",
        lastName: initialAccount.lastName ?? "",
        majors: toCommaList(initialAccount.majors ?? []),
        minors: toCommaList(initialAccount.minors ?? []),
        type: initialAccount.type ?? "",
        schoolEmail: initialAccount.schoolEmail ?? "",
        personalEmail: initialAccount.personalEmail ?? "",
        gradSemester: initialAccount.gradSemester ?? "",
        headshotBlobURL: initialAccount.headshotBlobURL ?? "",
        resumeBlobURL: initialAccount.resumeBlobURL ?? "",
        leaderType: initialAccount.leaderType ?? "",
        phoneNum: initialAccount.phoneNum ?? "",
        isNew: initialAccount.isNew ?? false,
        gradYear: initialAccount.gradYear?.toString() ?? "",
        pledgeClass: initialAccount.pledgeClass ?? "",
        hometown: initialAccount.hometown ?? "",
        linkedin: initialAccount.linkedin ?? "",
        github: initialAccount.github ?? ""
    }));

    React.useEffect(() => {
        if (state?.error) toast.error(state.error);
        if (state?.success) {
            toast.success(state.success);
            router.refresh();
        }
    }, [state?.error, state?.success, router]);

    function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    // --------------------------------------------
    // headshot upload + square crop (client-side)
    // --------------------------------------------
    const headshotInputRef = React.useRef<HTMLInputElement | null>(null);
    const [headshotPreview, setHeadshotPreview] = React.useState<string | null>(null);
    const [headshotName, setHeadshotName] = React.useState<string | null>(null);
    const [showCropper, setShowCropper] = React.useState(false);
    const [crop, setCrop] = React.useState({ x: 0, y: 0 });
    const [zoom, setZoom] = React.useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null);
    const [originalFile, setOriginalFile] = React.useState<File | null>(null);

    function triggerHeadshotSelect() {
        headshotInputRef.current?.click();
    }

    function onHeadshotChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) {
            clearHeadshot();
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.");
            e.target.value = "";
            clearHeadshot();
            return;
        }

        setHeadshotName(file.name);
        setOriginalFile(file);

        const url = URL.createObjectURL(file);
        setHeadshotPreview(url);
        setShowCropper(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    }

    const onCropComplete = (_croppedArea: Area, nextCroppedAreaPixels: Area) => {
        setCroppedAreaPixels(nextCroppedAreaPixels);
    };

    async function createImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new window.Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", (event: Event) => reject(event));
            image.setAttribute("crossOrigin", "anonymous");
            image.src = url;
        });
    }

    async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
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

        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error("Canvas is empty"));
                    resolve(blob);
                },
                "image/jpeg",
                0.92
            );
        });
    }

    async function handleSaveCrop() {
        try {
            if (!headshotPreview || !croppedAreaPixels || !originalFile) return;

            const croppedImage = await getCroppedImg(headshotPreview, croppedAreaPixels);

            const croppedFile = new File([croppedImage], originalFile.name, {
                type: "image/jpeg"
            });

            // update the file input with the cropped image
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(croppedFile);
            if (headshotInputRef.current) {
                headshotInputRef.current.files = dataTransfer.files;
            }

            // update preview
            const croppedUrl = URL.createObjectURL(croppedImage);
            setHeadshotPreview(croppedUrl);
            setShowCropper(false);
            toast.success("Headshot cropped successfully");
        } catch (e) {
            toast.error("Failed to crop image");
            console.error(e);
        }
    }

    function clearHeadshot() {
        if (headshotInputRef.current) {
            headshotInputRef.current.value = "";
        }
        setHeadshotPreview(null);
        setHeadshotName(null);
        setShowCropper(false);
        setOriginalFile(null);
        setCroppedAreaPixels(null);
    }

    function cancelHeadshotCrop() {
        clearHeadshot();
        setShowCropper(false);
    }

    const avatarSrc =
        headshotPreview && !showCropper ? headshotPreview : form.headshotBlobURL ? form.headshotBlobURL : null;

    const inner = (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <div
                    className="h-16 w-16 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    { avatarSrc ? (
                        <Image
                            src={ avatarSrc }
                            alt="Headshot"
                            width={ 64 }
                            height={ 64 }
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <User className="h-7 w-7 text-gray-500 dark:text-gray-400"/>
                    ) }
                </div>

                <div className="min-w-0">
                    <div className="text-xl font-bold text-gray-900 dark:text-white truncate">
                        { form.firstName } { form.lastName }
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Manage your profile details below</div>
                </div>
            </div>

            <form action={ formAction } className="space-y-6">
                {/* majors/minors */ }
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Majors (comma-separated)">
                        <input
                            name="majors"
                            value={ form.majors }
                            onChange={ (e) => set("majors", e.target.value) }
                            className="input"
                            placeholder="IIT, CS"
                        />
                    </Field>
                    <Field label="Minors (comma-separated)">
                        <input
                            name="minors"
                            value={ form.minors }
                            onChange={ (e) => set("minors", e.target.value) }
                            className="input"
                            placeholder="Business, Math"
                        />
                    </Field>
                </div>

                {/* emails */ }
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="School Email">
                        <input
                            id="schoolEmail"
                            name="schoolEmail"
                            type="email"
                            value={ form.schoolEmail ?? "" }
                            readOnly
                            aria-readonly="true"
                            tabIndex={ -1 }
                            className="opacity-70 cursor-not-allowed input"
                        />
                    </Field>
                    <Field label="Personal Email">
                        <input
                            name="personalEmail"
                            value={ form.personalEmail }
                            onChange={ (e) => set("personalEmail", e.target.value) }
                            className="input"
                            type="email"
                            placeholder="you@gmail.com"
                        />
                    </Field>
                </div>

                {/* grad */ }
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Grad Semester">
                        <select
                            name="gradSemester"
                            value={ form.gradSemester }
                            onChange={ (e) => set("gradSemester", e.target.value) }
                            className="input"
                        >
                            <option value="">None</option>
                            <option value="SPRING">SPRING</option>
                            <option value="FALL">FALL</option>
                        </select>
                    </Field>
                    <Field label="Grad Year">
                        <input
                            name="gradYear"
                            value={ form.gradYear }
                            onChange={ (e) => set("gradYear", e.target.value) }
                            className="input"
                            inputMode="numeric"
                            placeholder="2027"
                        />
                    </Field>
                </div>

                {/* links */ }
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="LinkedIn">
                        <input
                            name="linkedin"
                            value={ form.linkedin }
                            onChange={ (e) => set("linkedin", e.target.value) }
                            className="input"
                            placeholder="https://www.linkedin.com/in/username"
                        />
                    </Field>
                    <Field label="GitHub">
                        <input
                            name="github"
                            value={ form.github }
                            onChange={ (e) => set("github", e.target.value) }
                            className="input"
                            placeholder="https://github.com/username"
                        />
                    </Field>
                </div>

                {/* misc */ }
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Phone Number">
                        <input
                            name="phoneNum"
                            value={ form.phoneNum }
                            onChange={ (e) => set("phoneNum", e.target.value) }
                            className="input"
                            placeholder="(555) 123-4567"
                        />
                    </Field>

                    <Field label="Hometown">
                        <input
                            name="hometown"
                            value={ form.hometown }
                            onChange={ (e) => set("hometown", e.target.value) }
                            className="input"
                            placeholder="City, State"
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Headshot (square image)
                        </div>

                        {/* hidden input */ }
                        <input
                            ref={ headshotInputRef }
                            name="headshot"
                            type="file"
                            accept="image/*"
                            disabled={ isPending }
                            className="hidden"
                            onChange={ onHeadshotChange }
                        />

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={ triggerHeadshotSelect }
                                disabled={ isPending }
                                className="rounded-lg bg-[#315CA9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#23498F] transition disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                Choose Headshot
                            </button>

                            { headshotName ? (
                                <span
                                    className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[220px]">{ headshotName }</span>
                            ) : (
                                <span className="text-sm text-gray-500 dark:text-gray-500">No file selected</span>
                            ) }

                            { headshotName ? (
                                <button
                                    type="button"
                                    onClick={ clearHeadshot }
                                    className="text-sm font-semibold text-red-600 hover:text-red-700 transition"
                                >
                                    Clear
                                </button>
                            ) : null }
                        </div>

                        {/* cropper modal/panel */ }
                        { showCropper && headshotPreview ? (
                            <div
                                className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                                <div className="relative w-full h-[320px] rounded-lg overflow-hidden bg-black">
                                    <Cropper
                                        image={ headshotPreview }
                                        crop={ crop }
                                        zoom={ zoom }
                                        aspect={ 1 }
                                        onCropChange={ setCrop }
                                        onZoomChange={ setZoom }
                                        onCropComplete={ onCropComplete }
                                    />
                                </div>

                                <div className="mt-4 flex items-center gap-3">
                                    <label className="text-sm text-gray-700 dark:text-gray-300">Zoom</label>
                                    <input
                                        type="range"
                                        min={ 1 }
                                        max={ 3 }
                                        step={ 0.01 }
                                        value={ zoom }
                                        onChange={ (e) => setZoom(Number(e.target.value)) }
                                        className="w-full"
                                    />
                                </div>

                                <div className="mt-4 flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={ cancelHeadshotCrop }
                                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={ handleSaveCrop }
                                        className="rounded-lg bg-linear-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-500/30"
                                    >
                                        Save Crop
                                    </button>
                                </div>
                            </div>
                        ) : null }

                        {/* final preview */ }
                        { !showCropper && headshotPreview ? (
                            <div className="mt-3">
                                <Image
                                    src={ headshotPreview }
                                    alt="Selected headshot preview"
                                    width={ 112 }
                                    height={ 112 }
                                    className="rounded-md object-cover border"
                                />
                            </div>
                        ) : null }

                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Choose an image, crop it to a square, then save. The cropped image is what gets uploaded.
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Resume (PDF)</div>
                        <input
                            name="resume"
                            type="file"
                            accept="application/pdf"
                            disabled={ isPending }
                            className="block w-full text-sm text-gray-700 dark:text-gray-200 file:mr-4 file:rounded-lg file:border-0 file:bg-[#315CA9] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#23498F] dark:file:bg-[#315CA9]"
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400">Uploading a new file will replace your
                            current resume.
                        </div>
                    </div>
                </div>

                {/* submit */ }
                <div className="pt-2 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={ isPending }
                        className="rounded-lg bg-linear-to-r from-blue-600 to-blue-700 py-3 px-5 text-white font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        { isPending ? "Saving..." : "Save changes" }
                    </button>

                    { state?.success ?
                        <span className="text-sm text-green-700 dark:text-green-400">{ state.success }</span> : null }
                </div>
            </form>

            {/* tiny local styles */ }
            <style jsx global>{ `
                .input {
                    width: 100%;
                    border-radius: 0.75rem;
                    border: 1px solid rgb(209 213 219);
                    background: white;
                    padding: 0.75rem 1rem;
                    color: rgb(17 24 39);
                    outline: none;
                    transition: box-shadow 150ms, border-color 150ms, background 150ms;
                }

                .dark .input {
                    border-color: rgb(75 85 99);
                    background: rgb(31 41 55);
                    color: white;
                }

                .input:focus {
                    border-color: rgb(59 130 246);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
                }
            ` }</style>
        </div>
    );

    if (embedded) return inner;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 px-6 py-10">
            <div className="mx-auto w-full max-w-3xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Update your account details. Changes save to the public.accounts table.
                    </p>
                </div>

                <div
                    className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl dark:shadow-gray-900/50 p-6 md:p-8">
                    { inner }
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{ label }</div>
            { children }
        </div>
    );
}
