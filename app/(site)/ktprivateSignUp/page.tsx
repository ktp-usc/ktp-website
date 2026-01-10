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

export default function Application() {
        // --------------------------------------------
        // Resume upload UI helpers
        // --------------------------------------------
        const resumeInputRef = React.useRef<HTMLInputElement | null>(null);
        const [resumeName, setResumeName] = React.useState<string | null>(null);
        const router = useRouter();

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
    // REAL SUBMIT HANDLER — sends FormData to API
    // --------------------------------------------
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); // Stop GET request

        const form = e.currentTarget;
        const formData = new FormData(form);

        // Validate USC email domain
        const email = formData.get("email") as string;
        const emailLower = email?.toLowerCase() || "";
        const isSignUp = formData.append("signUp", "true");
        // Check for sc.edu (including subdomains like mailbox.sc.edu, email.sc.edu)
        const isGeneralScEdu = emailLower.includes("@") && emailLower.split("@")[1]?.endsWith("sc.edu");

        if (!isGeneralScEdu) {
            toast.error("Please use a valid USC email address.");
            return;
        }

        
  // Checks password against constraints
    const password = formData.get("password") as string;

    const requirements = {
        minLength: password.length >= 8, // At least 8 characters
        hasUppercase: /[A-Z]/.test(password), // At least one uppercase letter
        hasLowercase: /[a-z]/.test(password), // At least one lowercase letter
        hasDigit: /[0-9]/.test(password), // At least one number
    };

  // Check if all requirements are met
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

        // Validate required photo upload (image only)
        const photo = formData.get("photo") as File;
        if (!photo || photo.size === 0) {
            toast.error("Please upload a picture.");
            return;
        }
        if (!photo.type.startsWith("image/")) {
            toast.error("Picture must be an image file.");
            return;
        }

        // Submit to backend
        const res = await fetch("/api/accounts", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.error || "Submission failed");
            return;
        }

        router.push("/next-steps");
        form.reset();
        // Reset local UI state
        setPhotoPreview(null);
        setPhotoName(null);
        setResumeName(null);
    }

    // --------------------------------------------
    // Picture upload (required) — client-side only
    // --------------------------------------------
    const photoInputRef = React.useRef<HTMLInputElement | null>(null);
    const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
    const [photoName, setPhotoName] = React.useState<string | null>(null);

    function triggerPhotoSelect() {
        photoInputRef.current?.click();
    }

    function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) {
            setPhotoPreview(null);
            setPhotoName(null);
            return;
        }
        // Limit to images
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.");
            e.target.value = "";
            setPhotoPreview(null);
            setPhotoName(null);
            return;
        }
        setPhotoName(file.name);
        const url = URL.createObjectURL(file);
        setPhotoPreview(url);
    }

    function clearPhoto() {
        if (photoInputRef.current) {
            photoInputRef.current.value = "";
        }
        setPhotoPreview(null);
        setPhotoName(null);
    }

    return (
        <div className="overflow-x-hidden">
            <h1 className="text-5xl p4 pt-12 pb-3 font-bold text-center">Alpha Class Signup Page</h1>
            <h2 className="text-3xl p4 pb-6 text-[#315CA9] italic font-bold text-center">Spring 2026</h2>
            <div className="max-w-3xl w-full mx-auto">
                {/* Introduction */}
                <div className="pb-20">
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
                                        <FieldDescription>
                                            <em>Please ensure this is correct. All communications concerning the interview process will be sent via email.</em>
                                        </FieldDescription>
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
                                            placeholder="IIT, CE, CS, etc..."
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

                                    {/* Picture Upload (required) */}
                                    <Field>
                                        <FieldContent>
                                            <FieldLabel>
                                                <span className="text-md">Upload Picture <span className="text-red-500">*</span></span>
                                            </FieldLabel>
                                            <FieldDescription>
                                                Please include a headshot or photo to help us during the review process.
                                            </FieldDescription>
                                        </FieldContent>

                                        {/* Hidden file input so we can use a styled button */}
                                        <input
                                            ref={photoInputRef}
                                            id="photo"
                                            name="photo"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            required
                                            onChange={onPhotoChange}
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
                                                    onClick={clearPhoto}
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>

                                        {photoPreview && (
                                            <div className="mt-3">
                                                <Image
                                                    src={photoPreview}
                                                    alt="Selected preview"
                                                    width={112}
                                                    height={112}
                                                    className="rounded-md object-cover border"
                                                />
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
                                            <br/>
                                            <br/>
                                            <em>{`If you don't have a resume made, quickly write-up a bullet pointed list of
                                                 your previous jobs, leadership positions, involvement, technical projects,
                                                 etc. Don't worry if it's not polished, we're looking at the content, not formatting.`}</em>
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
                        </FieldGroup>
                    </form>
                </div>
            </div>
        </div>
    );
}
