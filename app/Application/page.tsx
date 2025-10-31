"use client"

import React, { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field";

export default function Application() {
    const [email, setEmail] = useState("");

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        toast.success(`Saved: ${email}`);
    }
    return (
        <div className= "max-w-3xl w-full mx-auto">
            <h1 className="text-2xl p4 pt-4 pb-5">KTP Rush Application</h1>
            <div className="pb-20">
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm">
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
                                        placeholder="user@email.sc.edu"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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
                                    <FieldLabel>Major</FieldLabel>
                                    <Input
                                        id="major"
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>Minor</FieldLabel>
                                    <Input
                                    id="minor"/>
                                </Field>
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
                            </FieldGroup>
                        </FieldSet>
                        <Field className="pt-4" orientation="horizontal">
                            <Button type="submit">Submit</Button>
                        </Field>
                    </FieldGroup>
                </form>
            </div>
        </div>
    )
}