"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field";
import React from "react";

export default function Application() {
    // --------------------------------------------
    // REAL SUBMIT HANDLER — sends FormData to API
    // --------------------------------------------
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); // Stop GET request

        const form = e.currentTarget;
        const formData = new FormData(form);

        // Require at least one rush event selection
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

        toast.success("Application submitted!");
        form.reset();
    }

    return (
        <div className="overflow-x-hidden">
            <div className="max-w-3xl w-full mx-auto">
                <h1 className="text-2xl p4 pt-4 pb-5 font-semibold">KTP Rush Application</h1>
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
                                        <FieldDescription>
                                            Select your current year in school. <em>Not by credit hours. For example, "Freshman" means first-year in University.</em>
                                        </FieldDescription>
                                    </Field>

                                    {/* GPA */}
                                    <Field>
                                        <FieldLabel>GPA<span className="text-red-500">*</span></FieldLabel>
                                        <Input
                                            id="gpa"
                                            name="gpa"
                                            type="text"
                                            required
                                            placeholder="e.g., 3.75"
                                        />
                                        <FieldDescription>
                                            <em>Kappa Theta Pi expects its brothers to maintain a minimum of a 3.00 GPA; however, we invite anyone interested in our organization to apply. If you are a current freshman (i.e. do not yet have a college GPA), please put "N/A" in the space below.</em>
                                        </FieldDescription>
                                    </Field>

                                    {/* Extenuating circumstances */}
                                    <Field>
                                        <FieldContent>
                                            <FieldLabel>Extenuating circumstances</FieldLabel>
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
                                            placeholder="IT, CE, CS, etc..."
                                        />
                                    </Field>

                                    {/* Minor */}
                                    <Field className="pb-3">
                                        <FieldLabel>Minor(s)</FieldLabel>
                                        <Input id="minor" name="minor" placeholder="optional"/>
                                    </Field>

                                    {/* Hometown, Home State */}
                                    <Field>
                                        <FieldLabel>Hometown, Home State</FieldLabel>
                                        <Input
                                            id="hometown"
                                            name="hometown"
                                            placeholder="City, State"
                                        />
                                    </Field>

                                    <FieldSeparator/>

                                    {/* Resume Upload */}
                                    <Field>
                                        <FieldLabel htmlFor="resume">Upload Resume/CV <span
                                            className="text-red-500">*</span></FieldLabel>
                                        <FieldDescription>
                                            Please attach your resume (.pdf, .doc, .jpg, .png)
                                            <br/>
                                            <em>If you don't have a resume made, quickly write-up a bullet pointed list of your previous jobs, leadership positions, involvement, technical projects, etc. Don't worry if it's not polished, we're looking at the content, not formatting. We'll help improve your resume during the process!</em>
                                        </FieldDescription>

                                        <Input
                                            id="resume"
                                            name="resume"
                                            type="file"
                                            accept=".pdf,.jpg,.png,.doc,.docx"
                                            required
                                        />
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
                                                Answer in less than 250 words
                                            </FieldDescription>
                                        </FieldContent>
                                        <Textarea
                                            id="reason"
                                            name="reason"
                                            placeholder="Enter text here"
                                            required
                                            className="min-h-[100px] resize-none sm:min-w-[300px]"
                                        />
                                    </Field>

                                    {/* Rush events attended (multi-select, required) */}
                                    <Field>
                                        <FieldContent>
                                            <FieldLabel>Which rush events did you attend?<span className="text-red-500">*</span></FieldLabel>
                                            <FieldDescription>
                                                Check all that apply (at least one required). <em>If you're completing this application early, select the events you plan on attending. Reach out to our Executive Secretary (contact in the FAQ) if you're unable to attend one of the events you select.</em>
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
