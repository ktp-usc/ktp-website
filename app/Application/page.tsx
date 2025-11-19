"use client";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
            <Header />
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

                                    {/* Email */}
                                    <Field>
                                        <FieldLabel htmlFor="email">USC Email<span className="text-red-500">*</span></FieldLabel>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="user@email.sc.edu"
                                        />
                                    </Field>

                                    {/* Classification */}
                                    <Field>
                                        <FieldLabel>Classification<span className="text-red-500">*</span></FieldLabel>
                                        <Select name="classification">
                                            <SelectTrigger>
                                                <SelectValue placeholder="None Selected" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="freshman">Freshman</SelectItem>
                                                <SelectItem value="sophomore">Sophomore</SelectItem>
                                                <SelectItem value="junior">Junior</SelectItem>
                                                <SelectItem value="senior">Senior</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldDescription>
                                            Select your classification.
                                        </FieldDescription>
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
                                        <Input id="minor" name="minor" placeholder="optional" />
                                    </Field>

                                    <FieldSeparator />

                                    {/* Resume Upload */}
                                    <Field>
                                        <FieldLabel htmlFor="resume">Upload Resume/CV <span className="text-red-500">*</span></FieldLabel>
                                        <FieldDescription>
                                            Please attach your resume (.pdf, .doc, .jpg, .png)
                                        </FieldDescription>

                                        <Input
                                            id="resume"
                                            name="resume"
                                            type="file"
                                            accept=".pdf,.jpg,.png,.doc,.docx"
                                            required
                                        />
                                    </Field>

                                    <FieldSeparator />

                                    {/* Why KTP */}
                                    <Field>
                                        <FieldContent>
                                            <FieldLabel>
                                                Why would you like to join KTP?
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

                                </FieldGroup>
                            </FieldSet>

                            <Field className="pt-4" orientation="horizontal">
                                <Button
                                    type="submit"
                                    className="bg-blue-900 text-lg font-semibold"
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
