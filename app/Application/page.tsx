"use client";
//need to make pages responsive, add form button to all pages, & fix handleSubmit
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function Application() {
    return (
        <>
            <Header />
            <div className="max-w-3xl w-full mx-auto">
                <h1 className="text-2xl p4 pt-4 pb-5 font-semibold">KTP Rush Application</h1>
                <div className="pb-20">
                    <form>
                        <FieldGroup>
                            <FieldSet>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel>Full Name<span className="text-red-500">*</span></FieldLabel>
                                        <Input
                                            id="name"
                                            placeholder="First and Last Name"
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="email">USC Email<span className="text-red-500">*</span></FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            placeholder="user@email.sc.edu"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Phone Number<span className="text-red-500">*</span></FieldLabel>
                                        <Input
                                            id="phone"
                                            required
                                            placeholder="(XXX)XXX-XXXX"
                                        />
                                    </Field>
                                    <Field className="pb-3">
                                        <FieldLabel>Hometown, Home State<span className="text-red-500">*</span></FieldLabel>
                                        <Input
                                            id="home"
                                            required
                                        />
                                    </Field>
                                    <FieldSeparator/>
                                    <Field>
                                        <FieldLabel>Classification<span className="text-red-500">*</span> </FieldLabel>
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
                                        <FieldLabel>Major(s) <span className="text-red-500">*</span> </FieldLabel>
                                        <Input
                                            id="major"
                                            required
                                            placeholder="IT, CE, CS, etc..."
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Minor(s)</FieldLabel>
                                        <Input id="minor" placeholder="optional" />
                                    </Field>
                                    <Field>
                                        <FieldLabel>GPA<span className="text-red-500">*</span></FieldLabel>
                                        <FieldDescription>
                                            Kappa Theta Pi expects its brothers to maintain a minimum of a 3.00 GPA;
                                            however, we invite anyone interested in our organization to apply. <br/>
                                            <br/>
                                            If you are a current freshman (i.e. do not yet have a college GPA), please put N/A in the space below
                                        </FieldDescription>
                                        <Input
                                            id="gpa"
                                            required
                                        />
                                    </Field>
                                    <Field className="pb-3">
                                        <FieldLabel>Extenuating Circumstances</FieldLabel>
                                        <FieldDescription>
                                            If your GPA is below a 3.00, please use the following to explain any extenuating
                                            circumstances or hardships you would like us to take into consideration.
                                        </FieldDescription>
                                        <Textarea></Textarea>
                                    </Field>
                                    <FieldSeparator />
                                    <Field>
                                        <FieldLabel htmlFor="resume">Upload Resume/CV <span className="text-red-500">*</span></FieldLabel>
                                        <FieldDescription>
                                            Please attach a copy of your resume (.pdf, .dox, .jpg,
                                            .png)
                                        </FieldDescription>
                                        <Input
                                            id="resume"
                                            type="file"
                                            name="attachment"
                                            accept=".pdf,.jpg,.png,.dox"
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>LinkedIn (optional)</FieldLabel>
                                        <Input
                                            id="linkedin"
                                            type="url"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Github (Optional)</FieldLabel>
                                        <Input
                                            id="github"
                                            type="url"
                                            />
                                    </Field>
                                    <FieldSeparator />
                                    <Field>
                                        <FieldLabel>
                                            Which rush events did you attend?<span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <FieldDescription className="italic font-semibold">
                                            If you are completing this application early, select the events you plan on attending.
                                            Reach out to our Executive Secretary (contact in the FAQ) if you are unable to attend one
                                            of the events you select.
                                        </FieldDescription>
                                        <FieldGroup className="gap-3">
                                            <FieldDescription>
                                                Check all that apply.
                                            </FieldDescription>
                                            <Field orientation="horizontal">
                                                <Checkbox />
                                                <FieldLabel>Info Session(s)</FieldLabel>
                                            </Field>
                                            <Field orientation="horizontal">
                                                <Checkbox />
                                                <FieldLabel>Rush Workshop</FieldLabel>
                                            </Field>
                                            <Field orientation="horizontal">
                                                <Checkbox />
                                                <FieldLabel>Pitch Night</FieldLabel>
                                            </Field>
                                            <Field orientation="horizontal">
                                                <Checkbox />
                                                <FieldLabel>KTP Field Day</FieldLabel>
                                            </Field>
                                        </FieldGroup>
                                    </Field>
                                    <Field className="pt-3">
                                        <FieldContent>
                                            <FieldLabel>Why are you interested in joining Kappa Theta Pi? What
                                                talents/experiences could you bring to the organization? <span className="text-red-500">*</span>
                                            </FieldLabel>
                                            <FieldDescription>
                                                Please limit your response to less than 150 words
                                            </FieldDescription>
                                        </FieldContent>
                                        <Textarea
                                            id="reason"
                                            placeholder="Enter text here"
                                            required
                                            className="min-h-[100px] resize-none sm:min-w-[300px]"
                                        />
                                    </Field>
                                    <FieldSeparator />
                                    <Field>
                                        <FieldLabel>
                                            I affirm this application is complete and correct to the
                                            best of my knowledge <span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <FieldDescription>
                                            Check all that apply.
                                        </FieldDescription>
                                        <FieldGroup className="gap-3">
                                            <Field orientation="horizontal">
                                                <Checkbox />
                                                <FieldLabel>Yes</FieldLabel>
                                            </Field>
                                        </FieldGroup>
                                    </Field>
                                </FieldGroup>
                            </FieldSet>
                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="bg-blue-900 text-lg text-white font-semibold transition-all duration-300
                    hover:scale-110 hover: drop-shadow-md"
                                    variant="outline"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toast("Submission Received");

                                        setTimeout(() => {
                                            window.location.href="/Application";
                                        }, 800);
                                    }}
                                    >
                                    Submit
                                </Button>
                            </div>
                        </FieldGroup>
                    </form>
                </div>
            </div>
        </>
    );
}
