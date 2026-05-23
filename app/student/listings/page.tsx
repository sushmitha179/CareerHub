"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ListingsPage() {
    const { data: session, status } = useSession();

    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("LATEST");

    const [applied, setApplied] = useState<string[]>([]);
    const [applyingId, setApplyingId] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (status !== "authenticated") return;

        async function fetchData() {
            try {
                setLoading(true);

                const [listRes, appRes] = await Promise.all([
                    fetch("/api/listings"),
                    fetch("/api/applications"),
                ]);

                if (!listRes.ok || !appRes.ok) {
                    setMessage("Failed to load data");
                    return;
                }

                const listingsData = await listRes.json();
                const appsData = await appRes.json();

                setListings(Array.isArray(listingsData) ? listingsData : []);

                const applications = Array.isArray(appsData)
                    ? appsData
                    : appsData.applications ?? [];

                setApplied(
                    applications.map((a: { listingId: string }) => a.listingId)
                );
            } catch (err) {
                console.error("Fetch error:", err);
                setMessage("Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [status]);

    async function apply(listingId: string) {
        const confirmed = confirm("Are you sure you want to apply?");
        if (!confirmed) return;

        try {
            setApplyingId(listingId);
            setMessage("");

            const res = await fetch("/api/applications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ listingId }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.error || "Failed to apply ❌");
                return;
            }

            setApplied((prev) =>
                prev.includes(listingId) ? prev : [...prev, listingId]
            );
            setMessage("Application submitted successfully ✅");
        } catch (err) {
            console.error(err);
            setMessage("Something went wrong ❌");
        } finally {
            setApplyingId(null);
        }
    }

    const filteredListings = [...listings]
        .filter(
            (l) => filter === "ALL" || l.type === filter
        )
        .filter((l) => {
            const q = search.toLowerCase();

            return (
                l.title?.toLowerCase().includes(q) ||
                l.description?.toLowerCase().includes(q) ||
                l.skills?.join(" ").toLowerCase().includes(q) ||
                l.location?.toLowerCase().includes(q) ||
                l.company?.name?.toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            if (sortBy === "TITLE") {
                return a.title.localeCompare(b.title);
            }

            if (sortBy === "DEADLINE") {
                return (
                    new Date(a.deadline).getTime() -
                    new Date(b.deadline).getTime()
                );
            }

            return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
        });
    if (status === "unauthenticated") {
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
                Loading listings...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            {/* HEADER */}
            <div className="mb-6 flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">
                        Opportunities 🚀
                    </h1>
                    <p className="text-gray-600">
                        Internships & Hackathons curated for you
                    </p>
                </div>

                <div className="flex gap-3 flex-wrap">
                    <input
                        placeholder="Search jobs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border px-3 py-2 rounded w-52"
                    />

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border px-3 py-2 rounded"
                    >
                        <option value="ALL">All</option>
                        <option value="INTERNSHIP">Internships</option>
                        <option value="JOB">Jobs</option>
                        <option value="HACKATHON">Hackathons</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border px-3 py-2 rounded"
                    >
                        <option value="LATEST">Latest</option>
                        <option value="DEADLINE">Deadline Soon</option>
                        <option value="TITLE">Title A-Z</option>
                    </select>
                </div>
            </div>

            {/* MESSAGE */}
            {message && (
                <div className="mb-5 bg-white border p-3 rounded-lg text-sm text-center shadow-sm">
                    {message}
                </div>
            )}

            {/* EMPTY */}
            {filteredListings.length === 0 && (
                <div className="text-center text-gray-500 mt-20">
                    No opportunities found 😕
                </div>
            )}

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {filteredListings.map((item: any) => {
                    const isApplied = applied.includes(item.id);
                    const isExpired =
                        new Date(item.deadline) < new Date();

                    return (
                        <div
                            key={item.id}
                            className="bg-white rounded-2xl shadow p-5"
                        >
                            <h2 className="text-xl font-semibold">
                                {item.title}
                            </h2>

                            <p className="text-sm text-gray-500">
                                {item.company?.name || "Unknown Company"}
                            </p>

                            <p className="text-xs text-gray-400">
                                📍 {item.location || "Remote"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                ⏳ Deadline:{" "}
                                {new Date(item.deadline).toLocaleDateString()}
                            </p>

                            <p className="text-sm text-gray-600 mt-2">
                                {item.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {item.skills?.map((skill: string) => (
                                    <span
                                        key={skill}
                                        className="bg-gray-200 text-xs px-2 py-1 rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <button
                                disabled={
                                    isApplied ||
                                    applyingId === item.id ||
                                    isExpired
                                }
                                onClick={() => apply(item.id)}
                                className={`mt-4 px-4 py-2 rounded text-white text-sm
                ${isExpired
                                        ? "bg-red-400"
                                        : isApplied
                                            ? "bg-gray-400"
                                            : applyingId === item.id
                                                ? "bg-yellow-500"
                                                : "bg-green-500 hover:bg-green-600"
                                    }`}
                            >
                                {isExpired
                                    ? "Expired"
                                    : isApplied
                                        ? "Applied ✅"
                                        : applyingId === item.id
                                            ? "Applying..."
                                            : "Apply"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}