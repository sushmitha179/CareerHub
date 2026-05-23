"use client";

import { useCallback, useEffect, useState } from "react";
import {
  APP_STATUSES,
  STATUS_LABELS,
  type AppStatusValue,
} from "@/lib/application-status";

type CompanyApplication = {
  id: string;
  status: string;
  createdAt: string;
  student?: {
    branch?: string;
    year?: number;
    college?: string;
    skills?: string[];
    hasResume?: boolean;
    resumeDownloadUrl?: string | null;
    resumeFileName?: string | null;
    user?: { name?: string; email?: string };
  };
  listing?: { title?: string };
};

export default function CompanyApplicationsPage() {
  const [applications, setApplications] = useState<CompanyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/company/applications", {
        cache: "no-store",
      });
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  async function updateStatus(
    applicationId: string,
    status: AppStatusValue
  ) {
    setUpdatingId(applicationId);
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: applicationId, status }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error +
            (data.details ? `\n\n${data.details}` : "")
        );
        await fetchApplications();
        return;
      }

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? { ...app, status: data.status }
            : app
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
      await fetchApplications();
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center">Loading applications...</div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Applications 📄</h1>
        <button
          onClick={fetchApplications}
          className="text-sm text-blue-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl shadow">
          No applications yet.
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => {
            const currentStatus = String(app.status).toUpperCase();

            return (
              <div
                key={app.id}
                className="bg-white p-6 rounded-2xl shadow"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {app.student?.user?.name}
                    </h2>
                    <p className="text-gray-500">
                      {app.student?.user?.email}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 min-w-[180px]">
                    <label className="text-xs text-gray-500 font-medium">
                      Application status
                    </label>
                    <select
                      value={
                        APP_STATUSES.includes(
                          currentStatus as AppStatusValue
                        )
                          ? currentStatus
                          : APP_STATUSES[0]
                      }
                      disabled={updatingId === app.id}
                      onChange={(e) =>
                        updateStatus(
                          app.id,
                          e.target.value as AppStatusValue
                        )
                      }
                      className="border rounded-lg px-3 py-2 text-sm bg-white disabled:opacity-50"
                    >
                      {APP_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Applied For:</span>{" "}
                    {app.listing?.title}
                  </p>
                  <p>
                    <span className="font-semibold">College:</span>{" "}
                    {app.student?.college || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Branch:</span>{" "}
                    {app.student?.branch || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Skills:</span>{" "}
                    {app.student?.skills?.join(", ")}
                  </p>
                </div>

                {app.student?.resumeDownloadUrl && (
                  <a
                    href={app.student.resumeDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 bg-green-500 text-white px-4 py-2 rounded-lg"
                  >
                    View Resume
                    {app.student.resumeFileName
                      ? ` (${app.student.resumeFileName})`
                      : ""}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
