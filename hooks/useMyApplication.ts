import {} from "react";

export type CreateApplicationBody = {
  fullName: string;
  email: string;

  classification?: string | null;
  major?: string | null;
  minor?: string | null;
  resumeUrl?: string | null;
  reason?: string | null;
  circumstance?: string | null;
  gpa?: string | number | null;
  eventsAttended?: string[] | null;
};
export function useMyApplication() {
  return {};
}

export async function createApplication(application: CreateApplicationBody) {
  const res = await fetch(`/api/applications/me`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(application),
  });
  if (!res.ok) {
    throw new Error(await res.json());
  }
  const data = await res.json();
}
