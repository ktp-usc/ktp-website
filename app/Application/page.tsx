"use client";
import React, { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";

export default function Application() {
  // form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [classification, setClassification] = useState("");
  const [major, setMajor] = useState("");
  const [minor, setMinor] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [reason, setReason] = useState("");

  // checkboxes (events attended)
  const [events, setEvents] = useState({
    infoSession: false,
    workshop: false,
    pitchNight: false,
    fieldDay: false,
  });

  const handleCheckboxChange = (key: keyof typeof events) => {
    setEvents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ✅ handleSubmit: sends data to /api/applications
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      // Optional: upload resume later, for now just send metadata
      const body = {
        fullName,
        email,
        classification,
        major,
        minor,
        resumeUrl: resume ? resume.name : "",
        reason,
        events: Object.keys(events).filter((k) => events[k as keyof typeof events]),
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Server error");

      toast.success("Application submitted successfully!");
      setFullName("");
      setEmail("");
      setClassification("");
      setMajor("");
      setMinor("");
      setResume(null);
      setReason("");
      setEvents({
        infoSession: false,
        workshop: false,
        pitchNight: false,
        fieldDay: false,
      });
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error(err);
    }
  }

  return (
    <div className="max-w-3xl w-full mx-auto">
      <h1 className="text-2xl p4 pt-4 pb-5 font-semibold">
        KTP Rush Application
      </h1>

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
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">USC Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="user@email.sc.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel>Classification</FieldLabel>
                  <Select onValueChange={setClassification}>
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
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                  />
                </Field>

                <Field className="pb-3">
                  <FieldLabel>Minor(s)</FieldLabel>
                  <Input
                    id="minor"
                    placeholder="optional"
                    value={minor}
                    onChange={(e) => setMinor(e.target.value)}
                  />
                </Field>

                <FieldSeparator />

                <Field>
                  <FieldLabel htmlFor="resume">Upload Resume/CV</FieldLabel>
                  <FieldDescription>
                    Please attach a copy of your resume (.pdf, .docx, .jpg, .png)
                  </FieldDescription>
                  <Input
                    id="resume"
                    type="file"
                    name="attachment"
                    accept=".pdf,.jpg,.png,.docx"
                    required
                    onChange={(e) =>
                      setResume(e.target.files ? e.target.files[0] : null)
                    }
                  />
                </Field>

                <FieldSeparator />

                <Field>
                  <FieldLabel>
                    Which rushing events did you attend?
                  </FieldLabel>
                  <FieldDescription>
                    Select the events you plan to or have already attended.
                  </FieldDescription>
                  <FieldGroup className="gap-3">
                    <Field orientation="horizontal">
                      <Checkbox
                        checked={events.infoSession}
                        onCheckedChange={() => handleCheckboxChange("infoSession")}
                      />
                      <FieldLabel>Info Session(s)</FieldLabel>
                    </Field>

                    <Field orientation="horizontal">
                      <Checkbox
                        checked={events.workshop}
                        onCheckedChange={() => handleCheckboxChange("workshop")}
                      />
                      <FieldLabel>Rush Workshop</FieldLabel>
                    </Field>

                    <Field orientation="horizontal">
                      <Checkbox
                        checked={events.pitchNight}
                        onCheckedChange={() => handleCheckboxChange("pitchNight")}
                      />
                      <FieldLabel>Pitch Night</FieldLabel>
                    </Field>

                    <Field orientation="horizontal">
                      <Checkbox
                        checked={events.fieldDay}
                        onCheckedChange={() => handleCheckboxChange("fieldDay")}
                      />
                      <FieldLabel>KTP Field Day</FieldLabel>
                    </Field>
                  </FieldGroup>
                </Field>

                <FieldSeparator />

                <Field>
                  <FieldContent>
                    <FieldLabel>Why would you like to join KTP?</FieldLabel>
                    <FieldDescription>
                      Answer prompt in less than 250 words.
                    </FieldDescription>
                  </FieldContent>
                  <Textarea
                    id="reason"
                    placeholder="Enter text here"
                    required
                    className="min-h-[100px] resize-none sm:min-w-[300px]"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </FieldSet>

            <Field className="pt-4" orientation="horizontal">
              <Button
                type="submit"
                className="bg-blue-900 text-lg font-semibold hover:bg-blue-800"
              >
                Submit
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
