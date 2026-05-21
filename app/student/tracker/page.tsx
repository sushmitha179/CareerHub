"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const STATUSES = ["ALL", "APPLIED", "INTERVIEWING", "OFFERED", "REJECTED"];

type Application = {
    id: string;
    status: string;
    createdAt: string;
    listing?: {
        title: string;
    };
};

export default function TrackerPage() {
    const { data: session, status: sessionStatus } = useSession();

    const [apps, setApps] = useState<Application[]>([]);
    const [filter, setFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (sessionStatus !== "authenticated") return;

        async function fetchApps() {
            try {
                setLoading(true);
                setError("");

                const res = await fetch("/api/applications");

                if (!res.ok) {
                    throw new Error("Failed to fetch applications");
                }

                const data = await res.json();

                setApps(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setError("Failed to load applications");
            } finally {
                setLoading(false);
            }
        }

        fetchApps();
    }, [sessionStatus]);



    const filtered =
        filter === "ALL"
            ? apps
            : apps.filter((a) => a.status === filter);

    // MORE REALISTIC PROGRESS
    const progress =
        apps.length === 0
            ? 0
            : Math.round(
                (apps.filter((a) => a.status === "OFFERED").length /
                    apps.length) *
                100
            );
    if (sessionStatus === "unauthenticated") {
        return (
            <div className="p-10 text-center">
                Please login first
            </div>
        );
    }
    if (
        session &&
        session.user.role !== "STUDENT"
    ) {
        return (
            <div className="p-10 text-center">
                Access Denied
            </div>
        );
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
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            {/* HEADER */}
            <h1 className="text-3xl font-bold mb-4">
                Smart Tracker 📊
            </h1>

            {/* PROGRESS */}
            <div className="bg-white p-4 rounded-xl shadow mb-6">
                <p className="text-sm mb-2">Offer Progress</p>

                <div className="w-full bg-gray-200 h-3 rounded">
                    <div
                        className="bg-green-500 h-3 rounded transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className="text-xs mt-2">
                    {progress}% success rate
                </p>
            </div>

            {/* FILTERS */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {STATUSES.map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-3 py-1 rounded transition ${filter === status
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* EMPTY */}
            {filtered.length === 0 && (
                <div className="text-gray-500">
                    No applications found 🚀
                    <p className="text-sm mt-2">
                        Start applying to opportunities
                    </p>
                </div>
            )}

            {/* LIST */}
            <div className="space-y-4">
                {filtered.map((app) => (
                    <div
                        key={app.id}
                        className="bg-white p-5 rounded-xl shadow flex justify-between items-center"
                    >
                        <div>
                            <h2 className="font-semibold text-lg">
                                {app.listing?.title || "Untitled"}
                            </h2>

                            <p className="text-sm text-gray-500">
                                {new Date(app.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        <div
                            className={`px-3 py-2 rounded text-white text-sm font-medium
    ${app.status === "APPLIED"
                                    ? "bg-blue-500"
                                    : app.status === "INTERVIEWING"
                                        ? "bg-yellow-500"
                                        : app.status === "OFFERED"
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                }`}
                        >
                            {app.status}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}