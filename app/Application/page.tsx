"use client"
//need to make pages responsive, add form button to all pages, & fix handleSubmit
import { Header } from "../Header";
import React, { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {Textarea} from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Field, FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field";

export default function Application() {

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        toast.success(`Submission Saved`);
    }
    return (
        <div className= "max-w-3xl w-full mx-auto">
            < Header />
            <h1 className="text-2xl p4 pt-4 pb-5">KTP Rush Application</h1>
            <div className="pb-20">
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        <FieldSet>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel>Full Name</FieldLabel>
                                    <Input
                                        id="name"
                                        placeholder="First and Last Name"
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="email">USC Email</FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        placeholder="user@email.sc.edu"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>Classification</FieldLabel>
                                    <Select>
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
                                <Field>
                                    <FieldLabel>Major(s)</FieldLabel>
                                    <Input
                                        id="major"
                                        required
                                        placeholder="IT, CE, CS, etc..."
                                    />
                                </Field>
                                <Field className="pb-3">
                                    <FieldLabel>Minor(s)</FieldLabel>
                                    <Input
                                    id="minor"
                                    placeholder="optional"
                                    />
                                </Field>
                                <FieldSeparator />
                                <Field>
                                    <FieldLabel htmlFor="resume">Upload Resume/CV</FieldLabel>
                                    <FieldDescription>Please attach a copy of your resume (.pdf, .dox, .jpg, .png)</FieldDescription>
                                    <Input
                                        id="resume"
                                        type="file"
                                        name="attachment"
                                        accept=".pdf,.jpg,.png,.dox"
                                        required
                                    />
                                </Field>
                                <FieldSeparator />
                                <Field>
                                    <FieldLabel>Which rushing events did you attend?</FieldLabel>
                                    <FieldDescription>Select the events you plan to or have already attended</FieldDescription>
                                    <FieldGroup className="gap-3">
                                        <Field orientation="horizontal">
                                            <Checkbox/>
                                            <FieldLabel>Info Session(s)</FieldLabel>
                                        </Field>
                                        <Field orientation="horizontal">
                                            <Checkbox/>
                                            <FieldLabel>Rush Workshop</FieldLabel>
                                        </Field>
                                        <Field orientation="horizontal">
                                            <Checkbox/>
                                            <FieldLabel>Pitch Night</FieldLabel>
                                        </Field>
                                        <Field orientation="horizontal">
                                            <Checkbox/>
                                            <FieldLabel>KTP Field Day</FieldLabel>
                                        </Field>
                                    </FieldGroup>
                                </Field>
                                <FieldSeparator />
                                <Field>
                                    <FieldContent>
                                        <FieldLabel>Why would you like to join KTP?</FieldLabel>
                                        <FieldDescription>Answer prompt in less than 250 words</FieldDescription>
                                    </FieldContent>
                                    <Textarea
                                        id="reason"
                                        placeholder="Enter text here"
                                        required
                                        className="min-h-[100px] resize-none sm:min-w-[300px]"
                                    />
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                        <Field className="pt-4" orientation="horizontal">
                            <Button type ="submit" className="bg-blue-900 text-lg font-semibold">Submit</Button>
                        </Field>
                    </FieldGroup>
                </form>
            </div>
        </div>
    )
}