import { useState, useEffect } from "react";
import { applications } from "@prisma/client";
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
export function useMyApplications() {
  const [applications, setApplications] = useState<applications[]>([]);
  const [loading, setLoading] = useState(false);

  async function getApplications() {
    try {
      setLoading(true);
      const res = await fetch("/api/applications/me");
      if (!res.ok) {
        return console.error(res);
      }

      const json = await res.json();
      setApplications(json.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  async function createApplication() {
    const res = await fetch(`/api/applications/me`, { method: "POST" });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error ?? "failed_to_create_application");
    }
    setApplications((prev) => [data.data, ...prev]);
  }

  useEffect(() => {
    getApplications();
  }, []);
  return { applications, loading, createApplication };
}

type useMyApplicationProps = {
  applicationId: string;
};

type UpdateApplicationData = Partial<applications> & {
  phoneNum?: string | null;
  headshotBlobURL?: string | null;
};

export function useMyApplication({ applicationId }: useMyApplicationProps) {
  const [application, setApplication] = useState<applications>();
  const [loading, setLoading] = useState(false);

  async function getApplication() {
    try {
      setLoading(true);

      const res = await fetch(`/api/applications/${applicationId}`);
      const data = await res.json();

      setApplication(data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function updateApplication(data: UpdateApplicationData) {
    try {
      setLoading(true);

      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json().catch(() => null);
        if (result?.error === "application_limit_reached") {
          throw new Error("application_limit_reached");
        }
        throw new Error("Failed to update application");
      }

      const result = await res.json();

      setApplication(result.data);

      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getApplication();
  }, [applicationId]);

  return {
    application,
    loading,
    updateApplication,
    setApplication,
  };
}
