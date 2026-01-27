"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";

interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
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

export default function Application() {
        // --------------------------------------------
        // Resume upload UI helpers
        // --------------------------------------------
        const resumeInputRef = React.useRef<HTMLInputElement | null>(null);
        const [resumeName, setResumeName] = React.useState<string | null>(null);
        const router = useRouter();

        // --------------------------------------------
        // Headshot cropping state
        // --------------------------------------------
        const photoInputRef = React.useRef<HTMLInputElement | null>(null);
        const [showPhotoCropper, setShowPhotoCropper] = React.useState(false);
        const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
        const [photoOriginalFile, setPhotoOriginalFile] = React.useState<File | null>(null);
        const [photoCrop, setPhotoCrop] = React.useState({ x: 0, y: 0 });
        const [photoZoom, setPhotoZoom] = React.useState(1);
        const [photoCroppedAreaPixels, setPhotoCroppedAreaPixels] = React.useState<PixelCrop | null>(null);
        const [croppedPhotoBlob, setCroppedPhotoBlob] = React.useState<Blob | null>(null);
        const [photoName, setPhotoName] = React.useState<string | null>(null);

        // --------------------------------------------
        // Success state
        // --------------------------------------------
        const [submitSuccess, setSubmitSuccess] = React.useState(false);

    function triggerResumeSelect() {
            resumeInputRef.current?.click();
        }

        function onResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
            const file = e.target.files?.[0];
            if (!file) {
                setResumeName(null);
                return;
            }
            if (!file.type.includes("pdf")) {
                toast.error("Resume must be a PDF file.");
                e.target.value = "";
                setResumeName(null);
                return;
            }
            setResumeName(file.name);
        }

        function clearResume() {
            if (resumeInputRef.current) {
                resumeInputRef.current.value = "";
            }
            setResumeName(null);
        }

    // --------------------------------------------
    // Photo upload and cropping handlers
    // --------------------------------------------
    React.useEffect(() => {
        return () => {
            if (photoPreview) URL.revokeObjectURL(photoPreview);
        };
    }, [photoPreview]);

    function triggerPhotoSelect() {
        photoInputRef.current?.click();
    }

    const onPhotoCropComplete = (_croppedArea: unknown, croppedAreaPixels: PixelCrop) => {
        setPhotoCroppedAreaPixels(croppedAreaPixels);
    };

    function clearPhotoCropState() {
        if (photoInputRef.current) photoInputRef.current.value = "";
        if (photoPreview) URL.revokeObjectURL(photoPreview);

        setShowPhotoCropper(false);
        setPhotoPreview(null);
        setPhotoOriginalFile(null);
        setPhotoCrop({ x: 0, y: 0 });
        setPhotoZoom(1);
        setPhotoCroppedAreaPixels(null);
        setCroppedPhotoBlob(null);
        setPhotoName(null);
    }

    async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Picture must be an image file.");
            e.target.value = "";
            return;
        }

        e.target.value = "";

        const url = URL.createObjectURL(file);
        setPhotoOriginalFile(file);
        setPhotoPreview(url);
        setShowPhotoCropper(true);
        setPhotoCrop({ x: 0, y: 0 });
        setPhotoZoom(1);
        setPhotoCroppedAreaPixels(null);
        setCroppedPhotoBlob(null);
    }

    async function handleSavePhotoCrop() {
        try {
            if (!photoPreview || !photoCroppedAreaPixels || !photoOriginalFile) {
                toast.error("Please crop your photo before saving.");
                return;
            }

            const croppedBlob = await getCroppedImg(photoPreview, photoCroppedAreaPixels);

            if (photoCroppedAreaPixels.width !== photoCroppedAreaPixels.height) {
                toast.error("Headshots must be square. Please adjust your crop.");
                return;
            }

            setCroppedPhotoBlob(croppedBlob);
            setPhotoName(photoOriginalFile.name);
            setShowPhotoCropper(false);
            toast.success("Photo cropped successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to crop photo");
        }
    }

    // --------------------------------------------
    // REAL SUBMIT HANDLER — creates account in Neon DB
    // --------------------------------------------
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        // Extract form values
        const firstName = (formData.get("firstName") as string)?.trim();
        const lastName = (formData.get("lastName") as string)?.trim();
        const email = (formData.get("email") as string)?.trim();
        const password = formData.get("password") as string;
        const phone = (formData.get("phone") as string)?.trim();
        const gradYear = (formData.get("gradYear") as string)?.trim();
        const gradSemester = formData.get("gradSemester") as string;
        const pledgeClass = formData.get("pledgeClass") as string;
        const major = (formData.get("major") as string)?.trim();
        const minor = (formData.get("minor") as string)?.trim();
        const hometown = (formData.get("hometown") as string)?.trim();
        const linkedin = (formData.get("linkedin") as string)?.trim();
        const github = (formData.get("github") as string)?.trim();

        // Validate USC email domain
        const emailLower = email?.toLowerCase() || "";
        const isGeneralScEdu = emailLower.includes("@") && emailLower.split("@")[1]?.endsWith("sc.edu");

        if (!isGeneralScEdu) {
            toast.error("Please use a valid USC email address.");
            return;
        }

        // Check password against constraints
        const requirements = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasDigit: /[0-9]/.test(password),
        };

        if (!Object.values(requirements).every(Boolean)) {
            toast.error("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
            return;
        }

        // Validate resume is PDF and required
        const resume = formData.get("resume") as File;
        if (!resume || resume.size === 0) {
            toast.error("Please upload a resume.");
            return;
        }
        if (!resume.type.includes("pdf")) {
            toast.error("Resume must be a PDF file.");
            return;
        }

        // Validate cropped photo
        if (!croppedPhotoBlob) {
            toast.error("Please upload and crop a picture.");
            return;
        }

        // Check if schoolEmail already exists
        try {
            const checkRes = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
            const checkData = await checkRes.json();

            if (checkData.exists) {
                toast.error("An account with this email already exists. Please sign in instead.");
                return;
            }
        } catch (err) {
            console.error("Error checking email:", err);
            toast.error("Failed to verify email. Please try again.");
            return;
        }

        // Create FormData with all fields including cropped photo
        const submitData = new FormData();
        submitData.append("firstName", firstName);
        submitData.append("lastName", lastName);
        submitData.append("email", email);
        submitData.append("password", password);
        submitData.append("phone", phone);
        submitData.append("gradYear", gradYear);
        submitData.append("gradSemester", gradSemester);
        submitData.append("pledgeClass", pledgeClass);
        submitData.append("major", major);
        if (minor) submitData.append("minor", minor);
        if (hometown) submitData.append("hometown", hometown);
        if (linkedin) submitData.append("linkedin", linkedin);
        if (github) submitData.append("github", github);

        // Add cropped photo as file
        const croppedFile = new File([croppedPhotoBlob], photoOriginalFile?.name || "photo.jpg", { type: "image/jpeg" });
        submitData.append("photo", croppedFile);
        submitData.append("resume", resume);

        // Submit to backend to create account
        try {
            const res = await fetch("/api/auth/brother-signup", {
                method: "POST",
                body: submitData,
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Submission failed");
                return;
            }

            // Show success message
            setSubmitSuccess(true);
            form.reset();
            clearPhotoCropState();
            setResumeName(null);
            toast.success("Account created successfully!");
        } catch (err) {
            console.error("Submission error:", err);
            toast.error("Failed to create account. Please try again.");
        }
    }


    return (
        <div className="overflow-x-hidden">
            <h1 className="text-3xl p4 pt-6 font-bold text-center">Active Member Portal Signup Page</h1>
            <div className="max-w-3xl w-full mx-auto">
                {/* Introduction */}
                <div className="pb-20">
                    <h3 className="text-lg p4 pt-12 pb-6">Please fill out every field!</h3>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <FieldSet>
                                <FieldGroup>

                                    {/* First Name */}
                                    <Field>
                                        <FieldLabel className="text-md">First Name<span className="text-red-500">*</span></FieldLabel>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            placeholder="First Name"
                                            required
                                        />
                                    </Field>

                                    {/* Last Name*/}
                                    <Field>
                                        <FieldLabel className="text-md">Last Name</FieldLabel>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            placeholder="Last Name"
                                            required
                                        />
                                    </Field>

                                    {/* Email */}
                                    <Field>
                                        <FieldLabel className="text-md" htmlFor="email">USC Email<span
                                            className="text-red-500">*</span></FieldLabel>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="user@email.sc.edu"
                                        />
                                    </Field>

                                    {/* Password */}
                                    <Field>
                                        <FieldLabel className="text-md">Account Password<span
                                            className="text-red-500">*</span></FieldLabel>
                                        <FieldDescription>
                                            <em>Please input a secure password meeting the following criteria: 1 uppercase, 1 lowercase, 1 number, 1 symbol, and 8 or more characters.</em>
                                        </FieldDescription>
                                        <Input
                                            id="password"
                                            name="password"
                                            required
                                            placeholder="Password1"
                                        />
                                    </Field>

                                    {/* Phone Number */}
                                    <Field>
                                        <FieldLabel className="text-md">Phone Number<span className="text-red-500">*</span></FieldLabel>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            required
                                            placeholder="(555) 123-4567"
                                        />
                                    </Field>

                                    {/* Year in School */}
                                    <Field>
                                        <FieldLabel className="text-md">Grad Year (ex. 2027)<span className="text-red-500">*</span></FieldLabel>
                                        <Input
                                            id="gradYear"
                                            name="gradYear"
                                            type="tel"
                                            required
                                            placeholder="2027"
                                        />
                                    </Field>

                                    {/* Graduating Semester */}
                                    <Field>
                                        <FieldLabel className="text-md">Graduating Semester<span className="text-red-500">*</span></FieldLabel>
                                        <FieldDescription>
                                        </FieldDescription>
                                        <Select name="gradSemester">
                                            <SelectTrigger>
                                                <SelectValue placeholder="None Selected"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="FALL">Fall</SelectItem>
                                                <SelectItem value="SPRING">Spring</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    {/* Pledge Class */}
                                    <Field>
                                        <FieldLabel className="text-md">Pledge Class<span className="text-red-500">*</span></FieldLabel>
                                        <FieldDescription>
                                        </FieldDescription>
                                        <Select name="pledgeClass">
                                            <SelectTrigger>
                                                <SelectValue placeholder="None Selected"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="founding">Founding</SelectItem>
                                                <SelectItem value="alpha">Alpha</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    {/* Major */}
                                    <Field>
                                        <FieldLabel className="text-md">Major(s) <span className="text-red-500">*</span> </FieldLabel>
                                        <Input
                                            id="major"
                                            name="major"
                                            required
                                            placeholder="Computer Science, Computer Information Systems, etc..."
                                        />
                                        <FieldDescription>
                                            <em>{`If you have multiple majors, enter as a comma-delimited list. ex: "Computer Science, Data Science"`}</em>
                                        </FieldDescription>
                                    </Field>

                                    {/* Minor */}
                                    <Field className="pb-3">
                                        <FieldLabel className="text-md">Minor(s)</FieldLabel>
                                        <Input id="minor" name="minor" placeholder="optional"/>
                                        <FieldDescription>
                                            <em>{`If you have multiple minors, enter as a comma-delimited list. ex: "Mathematics, Statistics"`}</em>
                                        </FieldDescription>
                                    </Field>

                                    {/* Hometown, Home State */}
                                    <Field>
                                        <FieldLabel className="text-md">Hometown</FieldLabel>
                                        <Input
                                            id="hometown"
                                            name="hometown"
                                            placeholder="City, State"
                                        />
                                    </Field>

                                    {/* Picture Upload (required) with cropping */}
                                    <Field>
                                        <FieldContent>
                                            <FieldLabel>
                                                <span className="text-md">Upload Headshot <span className="text-red-500">*</span></span>
                                            </FieldLabel>
                                        </FieldContent>

                                        {/* Hidden file input */}
                                        <input
                                            ref={photoInputRef}
                                            id="photo"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoChange}
                                        />

                                        <div className="flex items-center gap-3 mt-2">
                                            <Button
                                                type="button"
                                                onClick={triggerPhotoSelect}
                                                className="px-4 py-2 cursor-pointer"
                                            >
                                                Upload Picture
                                            </Button>
                                            {photoName && (
                                                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                    {photoName}
                                                </span>
                                            )}
                                            {photoName && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="text-red-600 hover:text-red-700 cursor-pointer"
                                                    onClick={clearPhotoCropState}
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>

                                        {/* Cropped photo preview */}
                                        {croppedPhotoBlob && !showPhotoCropper && (
                                            <div className="mt-3">
                                                <Image
                                                    src={URL.createObjectURL(croppedPhotoBlob)}
                                                    alt="Cropped preview"
                                                    width={112}
                                                    height={112}
                                                    className="rounded-md object-cover border"
                                                />
                                            </div>
                                        )}

                                        {/* Cropper UI */}
                                        {showPhotoCropper && photoPreview && (
                                            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                <div className="mb-4">
                                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                                        Zoom: {(photoZoom * 100).toFixed(0)}%
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min={1}
                                                        max={3}
                                                        step={0.1}
                                                        value={photoZoom}
                                                        onChange={(e) => setPhotoZoom(Number(e.target.value))}
                                                        className="w-full"
                                                    />
                                                </div>

                                                <div className="relative w-full h-64 bg-gray-900 rounded-md overflow-hidden mb-4">
                                                    <Cropper
                                                        image={photoPreview}
                                                        crop={photoCrop}
                                                        zoom={photoZoom}
                                                        aspect={1}
                                                        showGrid
                                                        onCropChange={setPhotoCrop}
                                                        onCropComplete={onPhotoCropComplete}
                                                        onZoomChange={setPhotoZoom}
                                                    />
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        type="button"
                                                        onClick={handleSavePhotoCrop}
                                                        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        Save Crop
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={clearPhotoCropState}
                                                        className="cursor-pointer text-red-600 hover:text-red-700"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>

                                                <p className="mt-3 text-xs text-gray-500">
                                                    Headshots must be square. Crop and save to continue.
                                                </p>
                                            </div>
                                        )}
                                    </Field>

                                    <FieldSeparator/>

                                    {/* Resume Upload */}
                                    <Field>
                                        <FieldLabel className="text-md" htmlFor="resume">Upload Resume/CV <span
                                            className="text-red-500">*</span></FieldLabel>
                                        <FieldDescription>
                                            PDF format only.
                                        </FieldDescription>

                                        {/* Hidden file input so we can style the control */}
                                        <input
                                            id="resume"
                                            name="resume"
                                            type="file"
                                            accept=".pdf"
                                            className="hidden"
                                            required
                                            ref={resumeInputRef}
                                            onChange={onResumeChange}
                                        />

                                        <div className="flex items-center gap-3 mt-2">
                                            <Button type="button" onClick={triggerResumeSelect} className="px-4 py-2 cursor-pointer">
                                                Upload Resume (PDF)
                                            </Button>
                                            {resumeName ? (
                                                <span className="text-sm text-muted-foreground truncate max-w-[240px]">
                                                    {resumeName}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">No file selected</span>
                                            )}
                                            {resumeName && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={clearResume}
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>
                                    </Field>

                                    {/* LinkedIn */}
                                    <Field>
                                        <FieldLabel className="text-md">LinkedIn Link</FieldLabel>
                                        <Input
                                            id="linkedin"
                                            name="linkedin"
                                            type="url"
                                            placeholder="https://www.linkedin.com/in/username"
                                            required
                                        />
                                    </Field>

                                    {/* GitHub */}
                                    <Field>
                                        <FieldLabel className="text-md">GitHub</FieldLabel>
                                        <Input
                                            id="github"
                                            name="github"
                                            type="url"
                                            placeholder="https://github.com/username"
                                            required
                                        />
                                    </Field>

                                    <FieldSeparator/>

                                </FieldGroup>
                            </FieldSet>

                            <Field className="pt-4" orientation="horizontal">
                                <Button
                                    type="submit"
                                    className="px-6 py-3 bg-[#315CA9] text-white rounded-lg font-semibold transition-all duration-300 hover:bg-[#23498F] hover:scale-110 hover:drop-shadow-md cursor-pointer"
                                >
                                    Submit
                                </Button>
                            </Field>

                            {submitSuccess && (
                                <p className="mt-4 text-green-600 font-semibold">
                                    Congrats, your sign up worked! Go Sign-In on the top right of the page to access your portal.
                                </p>
                            )}
                        </FieldGroup>
                    </form>
                </div>
            </div>
        </div>
    );
}
