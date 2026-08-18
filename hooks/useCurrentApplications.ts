import { useEffect, useState } from "react";
import { applications } from "@prisma/client";

export function useCurrentApplications() {
  const [applications, setApplications] = useState<applications[]>([]);
  const [loading, setLoading] = useState(false);
  async function getApplications() {
    try {
      setLoading(true);
      const res = await fetch(`/api/applications?current=true`);
      const data = await res.json();
      setApplications(data.data.items);
    } catch (error) {
      throw new Error("could not fetch applications");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    getApplications();
  }, []);

  return { loading, applications };
}
