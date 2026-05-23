"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApplicationStats } from "@/lib/application-stats";
import {
  computeApplicationStats,
  emptyApplicationStats,
} from "@/lib/application-stats";

export type StudentApplication = {
  id: string;
  status: string;
  createdAt: string;
  listingId?: string;
  listing?: {
    id?: string;
    title: string;
    type?: string;
    location?: string;
    company?: { name?: string };
  };
};

type ApplicationsResponse = {
  applications: StudentApplication[];
  stats: ApplicationStats;
};

function parseApplicationsResponse(data: unknown): ApplicationsResponse {
  if (Array.isArray(data)) {
    const applications = data as StudentApplication[];
    return {
      applications,
      stats: computeApplicationStats(applications),
    };
  }

  const payload = data as Partial<ApplicationsResponse>;
  return {
    applications: Array.isArray(payload.applications)
      ? payload.applications
      : [],
    stats: payload.stats ?? emptyApplicationStats(),
  };
}

export function useStudentApplications(enabled: boolean) {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [stats, setStats] = useState<ApplicationStats>(emptyApplicationStats());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = useCallback(async () => {
    if (!enabled) return;

    try {
      setError("");
      const res = await fetch("/api/applications", { cache: "no-store" });

      if (!res.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await res.json();
      const parsed = parseApplicationsResponse(data);

      setApplications(parsed.applications);
      setStats(parsed.stats);
    } catch (err) {
      console.error(err);
      setError("Failed to load applications");
      setApplications([]);
      setStats(emptyApplicationStats());
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    setLoading(true);
    fetchApplications();
  }, [enabled, fetchApplications]);

  useEffect(() => {
    if (!enabled) return;

    const onFocus = () => fetchApplications();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [enabled, fetchApplications]);

  return {
    applications,
    stats,
    loading,
    error,
    refetch: fetchApplications,
  };
}
