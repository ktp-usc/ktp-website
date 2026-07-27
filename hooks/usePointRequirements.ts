import { PointRequirement } from "@prisma/client";
import { useState, useEffect } from "react";
type pointRequirementInput = {
  id?: string;
  memberType: string;
  semester: string;
  name: string;
  description: string;
  requiredAmount: number;
  pointsPerCompletion: number;
  maxPoints: number;
};

export function usePointRequirements() {
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState<PointRequirement[]>([]);
  async function getRequirements() {
    try {
      const res = await fetch("/api/requirements");
      if (!res.ok) {
        throw new Error("could not get requirements");
      }
      const requirements: PointRequirement[] = await res.json();
      setRequirements(requirements);
    } catch (error) {
      throw new Error("could not fetch requirements");
    } finally {
      setLoading(false);
    }
  }
  async function createPointRequirement(requirement: pointRequirementInput) {
    try {
      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requirement),
      });
      if (!res.ok) {
        throw new Error("Failed to create point requirement");
      }

      const newRequirement = await res.json();
      setRequirements((prev) => [...prev, newRequirement]);
    } catch (err) {
      throw err;
    }
  }
  useEffect(() => {
    getRequirements();
  }, []);
  async function updatePointRequirement(
    requirement: pointRequirementInput,
    id: string,
  ) {
    try {
      const res = await fetch(`/api/requirements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requirement),
      });
      const req = await res.json();
      setRequirements((prevs) =>
        prevs.map((prev) => {
          if (prev.id === id) {
            return req;
          }

          return prev;
        }),
      );
    } catch (error) {
      throw error;
    }
  }

  async function deletePointRequirement(id: string) {
    try {
      const response = await fetch(`/api/requirements/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("could not delete requirement");
      }
      setRequirements((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      throw error;
    }
  }
  return {
    createPointRequirement,
    updatePointRequirement,
    deletePointRequirement,
    requirements,
    loading,
  };
}
