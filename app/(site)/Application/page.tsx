"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import NextImage from "next/image";
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
        
        // Check for sc.edu (including subdomains like mailbox.sc.edu, email.sc.edu)
        const isGeneralScEdu = emailLower.includes("@") && emailLower.split("@")[1]?.endsWith("sc.edu");

        if (!isGeneralScEdu) {
            toast.error("Please use a valid USC email address.");
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
        const rushEvents = formData.getAll("rushEvents");
        if (rushEvents.length === 0) {
            toast.error("Please select at least one rush event attended.");
            return;
        }

        // Submit to backend
        const res = await fetch("/api/applications", {
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
    const [showCropper, setShowCropper] = React.useState(false);
    const [crop, setCrop] = React.useState({ x: 0, y: 0 });
    const [zoom, setZoom] = React.useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<PixelCrop | null>(null);
    const [originalFile, setOriginalFile] = React.useState<File | null>(null);

    function triggerPhotoSelect() {
        photoInputRef.current?.click();
    }

    function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) {
            setPhotoPreview(null);
            setPhotoName(null);
            setShowCropper(false);
            return;
        }
        // Limit to images
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.");
            e.target.value = "";
            setPhotoPreview(null);
            setPhotoName(null);
            setShowCropper(false);
            return;
        }
        setPhotoName(file.name);
        setOriginalFile(file);
        const url = URL.createObjectURL(file);
        setPhotoPreview(url);
        setShowCropper(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    }

    const onCropComplete = (croppedArea: unknown, croppedAreaPixels: PixelCrop) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    async function createImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", (err) => reject(err));
            image.setAttribute("crossOrigin", "anonymous");
            image.src = url;
        });
    }

    async function getCroppedImg(
        imageSrc: string,
        pixelCrop: PixelCrop
    ): Promise<Blob> {
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
            canvas.toBlob((blob) => {
                resolve(blob as Blob);
            }, "image/jpeg");
        });
    }

    async function handleSaveCrop() {
        try {
            if (!photoPreview || !croppedAreaPixels || !originalFile) return;

            const croppedImage = await getCroppedImg(photoPreview, croppedAreaPixels);
            const croppedFile = new File([croppedImage], originalFile.name, {
                type: "image/jpeg",
            });

            // Update the file input with the cropped image
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(croppedFile);
            if (photoInputRef.current) {
                photoInputRef.current.files = dataTransfer.files;
            }

            // Update preview
            const croppedUrl = URL.createObjectURL(croppedImage);
            setPhotoPreview(croppedUrl);
            setShowCropper(false);
            toast.success("Photo cropped successfully");
        } catch (e) {
            toast.error("Failed to crop image");
            console.error(e);
        }
    }

    function clearPhoto() {
        if (photoInputRef.current) {
            photoInputRef.current.value = "";
        }
        setPhotoPreview(null);
        setPhotoName(null);
        setShowCropper(false);
    }

    return (
        <div className="overflow-x-hidden">
            <div className="max-w-3xl w-full mx-auto">
                <h1 className="text-4xl pt-4 pb-6 font-bold">KTP Rush Application: Spring 2026</h1>
                
                {/* Introduction */}
                <div className="mb-8 space-y-4 mt-4">
                    <p>
                        Thank you for your interest in becoming a member of Kappa Theta Pi!
                    </p>
                    <p>
                        Kappa Theta Pi is a Professional Co-Ed Technology Fraternity founded in 2012, aiming to
                        develop a talented slate of future computing professionals. The Alpha Theta Chapter at 
                        the University of South Carolina welcomes you to its second recruitment cycle for its 
                            Beta class.
                    </p>
                    <p>
                        If you have any questions, please reach out to the executive board at {' '}
                        <a href="mailto:soktp@mailbox.sc.edu" className="text-blue-500 underline">soktp@mailbox.sc.edu</a>.
                        <em> Please note that this application will not save your progress.</em>
                    </p>
                </div>

                {/* Info Card with grey background and float effect */}
                <Card className="bg-gray-50/80 border-gray-200 shadow-md mb-8 float-left w-full h-fit clear-both">
                    <CardContent className="pt-fit middle-align">
                        <p className="font-bold text-gray-900 flex items-center gap-2">
                            <svg
                                className="w-5 h-5 text-[#315CA9] flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>

                            This application is due{" "}
                            <a
                                href="https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MG5qaDU2c3M0b3A5a2lucTMxZGtiM2FzZ2IgMWIyMDM0Mzc1MWQwMTMwNzRlNWY1ZjgyYmZjYjcwYTljZjRmZmJhN2E1YTU5ZDkzYzkyZjNiMjg5NGY3ZWY2NkBn&tmsrc=1b20343751d013074e5f5f82bfcb70a9cf4ffba7a5a59d93c92f3b2894f7ef66%40group.calendar.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#315CA9] underline hover:text-[#003166]"
                            >
                                Friday, January 30th, 9 PM EST
                            </a>

                        </p>

                        <p className="text-sm text-gray-600 mt-1 italic">
                            &emsp;&emsp;We will not accept responses after this time.
                        </p>
                    </CardContent>
                </Card>


                <div className="pb-20">
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <FieldSet>
                                <FieldGroup>

                                    {/* Full Name */}
                                    <Field>
                                        <FieldLabel>Full Name<span className="text-red-500">*</span></FieldLabel>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="First and Last Name"
                                            required
                                        />
                                    </Field>

                                    {/* Preferred First Name (optional) */}
                                    <Field>
                                        <FieldLabel>Preferred First Name</FieldLabel>
                                        <Input
                                            id="preferredFirstName"
                                            name="preferredFirstName"
                                            placeholder="Optional"
                                        />
                                    </Field>

                                    {/* Email */}
                                    <Field>
                                        <FieldLabel htmlFor="email">USC Email<span
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

                                    {/* Phone Number */}
                                    <Field>
                                        <FieldLabel>Phone Number<span className="text-red-500">*</span></FieldLabel>
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
                                        <FieldLabel>Year in School<span className="text-red-500">*</span></FieldLabel>
                                        <FieldDescription>
                                            <em>{`Not by credit hours. For example, "Freshman" means first-year in University.`}</em>
                                        </FieldDescription>
                                        <Select name="classification">
                                            <SelectTrigger>
                                                <SelectValue placeholder="None Selected"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="freshman">Freshman</SelectItem>
                                                <SelectItem value="sophomore">Sophomore</SelectItem>
                                                <SelectItem value="junior">Junior</SelectItem>
                                                <SelectItem value="senior">Senior</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    {/* GPA */}
                                    <Field>
                                        <FieldLabel>GPA<span className="text-red-500">*</span></FieldLabel>
                                        <FieldDescription>
                                            <em>Kappa Theta Pi expects its brothers to maintain a minimum of a 3.00 GPA; however, we invite anyone interested in our organization to apply.</em>
                                        </FieldDescription>
                                        <Input
                                            id="gpa"
                                            name="gpa"
                                            type="text"
                                            required
                                            placeholder="e.g., 3.75"
                                        />
                                    </Field>

                                    {/* Extenuating circumstances */}
                                    <Field>
                                        <FieldContent>
                                            <FieldLabel>Extenuating Circumstances</FieldLabel>
                                            <FieldDescription>
                                                If your GPA is below a 3.00, please use the following to explain any extenuating circumstances or hardships you would like us to take into consideration
                                            </FieldDescription>
                                        </FieldContent>
                                        <Textarea
                                            id="extenuatingCircumstances"
                                            name="extenuatingCircumstances"
                                            placeholder="Enter text here"
                                            className="min-h-[100px] resize-none sm:min-w-[300px]"
                                        />
                                    </Field>

                                    {/* Major */}
                                    <Field>
                                        <FieldLabel>Major(s) <span className="text-red-500">*</span> </FieldLabel>
                                        <Input
                                            id="major"
                                            name="major"
                                            required
                                            placeholder="IIT, CE, CS, etc..."
                                        />
                                        <FieldDescription>
                                            <em>KTP accepts all majors!</em>
                                        </FieldDescription>
                                    </Field>

                                    {/* Minor */}
                                    <Field className="pb-3">
                                        <FieldLabel>Minor(s)</FieldLabel>
                                        <Input id="minor" name="minor" placeholder="optional"/>
                                    </Field>

                                    {/* Hometown, Home State */}
                                    <Field>
                                        <FieldLabel>Hometown</FieldLabel>
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
                                                Upload Picture <span className="text-red-500">*</span>
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

                                        {/* Crop Modal */}
                                        {showCropper && photoPreview && (
                                            <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                                                <div className="mb-4">
                                                    <label className="text-sm font-medium mb-2 block">
                                                        Zoom: {(zoom * 100).toFixed(0)}%
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min={1}
                                                        max={3}
                                                        step={0.1}
                                                        value={zoom}
                                                        onChange={(e) => setZoom(Number(e.target.value))}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div className="relative w-full h-64 bg-gray-900 rounded-md overflow-hidden mb-4">
                                                    <Cropper
                                                        image={photoPreview}
                                                        crop={crop}
                                                        zoom={zoom}
                                                        aspect={1 / 1}
                                                        showGrid={true}
                                                        onCropChange={setCrop}
                                                        onCropComplete={onCropComplete}
                                                        onZoomChange={setZoom}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        onClick={handleSaveCrop}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        Save Crop
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {photoPreview && !showCropper && (
                                            <div className="mt-3 flex flex-col gap-2">
                                                <p className="text-sm text-gray-600">Preview:</p>
                                                <NextImage
                                                    src={photoPreview}
                                                    alt="Selected preview"
                                                    width={112}
                                                    height={112}
                                                    className="rounded-md object-cover border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowCropper(true)}
                                                    className="w-fit text-sm"
                                                >
                                                    Edit Crop
                                                </Button>
                                            </div>
                                        )}
                                    </Field>

                                    <FieldSeparator/>

                                    {/* Resume Upload */}
                                    <Field>
                                        <FieldLabel htmlFor="resume">Upload Resume/CV <span
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

                                    {/* LinkedIn (optional) */}
                                    <Field>
                                        <FieldLabel>LinkedIn (optional)</FieldLabel>
                                        <Input
                                            id="linkedin"
                                            name="linkedin"
                                            type="url"
                                            placeholder="https://www.linkedin.com/in/username"
                                        />
                                    </Field>

                                    {/* GitHub (optional) */}
                                    <Field>
                                        <FieldLabel>GitHub (optional)</FieldLabel>
                                        <Input
                                            id="github"
                                            name="github"
                                            type="url"
                                            placeholder="https://github.com/username"
                                        />
                                    </Field>

                                    <FieldSeparator/>

                                    {/* Why KTP */}
                                    <Field>
                                        <FieldContent>
                                            <FieldLabel>
                                                Why are you interested in joining Kappa Theta Pi? What talents/experiences could you bring to the organization?
                                                <span className="text-red-500">*</span>
                                            </FieldLabel>
                                            <FieldDescription>
                                                Answer in less than 150 words.
                                            </FieldDescription>
                                        </FieldContent>
                                        <Textarea
                                            id="reason"
                                            name="reason"
                                            placeholder="Note: this application will not save your progress"
                                            required
                                            className="min-h-[100px] resize-none sm:min-w-[300px]"
                                        />
                                    </Field>

                                    {/* Rush events attended (multi-select, required) */}
                                    <Field>
                                        <FieldContent>
                                            <FieldLabel>Which rush events did you attend?<span className="text-red-500">*</span></FieldLabel>
                                            <FieldDescription>
                                                {`Check all that apply (at least one required). `}<em>{`If you're completing this application early,
                                                 select the events you plan on attending. Reach out to our Executive Secretary in the GroupMe
                                                 (Josiah White) if you're unable to attend an event.`}</em>
                                            </FieldDescription>
                                        </FieldContent>
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" name="rushEvents" value="info-night" className="h-4 w-4 rounded border" />
                                                <span>Info Night</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" name="rushEvents" value="field-day" className="h-4 w-4 rounded border" />
                                                <span>Field Day</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" name="rushEvents" value="technical-workshop" className="h-4 w-4 rounded border" />
                                                <span>Technical Workshop</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" name="rushEvents" value="pitch-night" className="h-4 w-4 rounded border" />
                                                <span>Pitch Night</span>
                                            </label>
                                        </div>
                                    </Field>

                                    <FieldSeparator/>

                                    {/* Affirmation */}
                                    <Field>
                                        <FieldLabel>I affirm this application is complete and correct to the best of my knowledge.<span className="text-red-500">*</span></FieldLabel>
                                        <div className="flex items-center gap-2">
                                            <input
                                                id="affirmation"
                                                name="affirmation"
                                                type="checkbox"
                                                value="yes"
                                                required
                                                className="h-4 w-4 rounded border"
                                            />
                                            <label htmlFor="affirmation">Yes</label>
                                        </div>
                                    </Field>

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
