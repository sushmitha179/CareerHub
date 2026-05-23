"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { AppStatusValue } from "@/lib/application-status";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  TRACKER_STATUSES,
} from "@/lib/application-stats";
import { useStudentApplications } from "@/lib/hooks/use-student-applications";

const FILTER_OPTIONS = ["ALL", ...TRACKER_STATUSES] as const;

export default function TrackerPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [filter, setFilter] = useState<(typeof FILTER_OPTIONS)[number]>("ALL");

  const enabled =
    sessionStatus === "authenticated" && session?.user?.role === "STUDENT";

  const { applications, stats, loading, error, refetch } =
    useStudentApplications(enabled);

  const filtered =
    filter === "ALL"
      ? applications
      : applications.filter(
          (a) => String(a.status).toUpperCase() === filter
        );

  const countForFilter = (key: (typeof FILTER_OPTIONS)[number]) => {
    if (key === "ALL") return stats.total;
    return stats[key as AppStatusValue] ?? 0;
  };

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="p-10 text-center">Please login first</div>
    );
  }

  if (session && session.user.role !== "STUDENT") {
    return <div className="p-10 text-center">Access Denied</div>;
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading applications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-500">
        {error}
        <button
          onClick={() => refetch()}
          className="block mx-auto mt-4 text-blue-600 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Smart Tracker 📊</h1>
        <button
          onClick={() => refetch()}
          className="text-sm text-blue-600 hover:underline self-start"
        >
          Refresh
        </button>
      </div>

      {/* SUCCESS RATE */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium">Success Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.successRate}%
          </p>
        </div>
        <div className="w-full bg-gray-200 h-3 rounded">
          <div
            className="bg-green-500 h-3 rounded transition-all duration-300"
            style={{ width: `${stats.successRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {stats.OFFERED} offered out of {stats.total} total applications
        </p>
      </div>

      {/* STATUS COUNTS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {TRACKER_STATUSES.map((status) => (
          <div
            key={status}
            className="bg-white p-4 rounded-xl shadow text-center"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {STATUS_LABELS[status]}
            </p>
            <p className="text-2xl font-bold mt-1">{stats[status]}</p>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTER_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded transition text-sm ${
              filter === status
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {status === "ALL" ? "All" : STATUS_LABELS[status as AppStatusValue]} (
            {countForFilter(status)})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-gray-500">
          No applications found 🚀
          <p className="text-sm mt-2">Start applying to opportunities</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const status = String(app.status).toUpperCase() as AppStatusValue;
            const color =
              STATUS_COLORS[status] ?? "bg-gray-500";

            return (
              <div
                key={app.id}
                className="bg-white p-5 rounded-xl shadow flex justify-between items-center gap-4"
              >
                <div>
                  <h2 className="font-semibold text-lg">
                    {app.listing?.title || "Untitled"}
                  </h2>
                  {app.listing?.company?.name && (
                    <p className="text-sm text-gray-600">
                      {app.listing.company.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`px-3 py-2 rounded text-white text-sm font-medium whitespace-nowrap ${color}`}
                >
                  {STATUS_LABELS[status] ?? app.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
