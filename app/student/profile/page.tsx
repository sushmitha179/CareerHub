"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [form, setForm] = useState({
        branch: "",
        year: "",
        skills: "",
        college: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/student");

                if (!res.ok) {
                    setMessage("Failed to load profile");
                    return;
                }

                const data = await res.json();

                if (data) {
                    setForm({
                        branch: data.branch || "",
                        year: data.year?.toString() || "",
                        skills: Array.isArray(data.skills)
                            ? data.skills.join(", ")
                            : "",
                        college: data.college || "",
                    });
                }
            } catch (error) {
                console.error(error);
                setMessage("Error loading profile");
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (saving) return;

        setSaving(true);
        setMessage("");

        // BASIC VALIDATION
        const yearNum = Number(form.year);
        if (
            yearNum &&
            (yearNum < 1 || yearNum > 5)
        ) {
            setMessage("❌ Invalid academic year");
            setSaving(false);
            return;
        }
        if (
            !form.branch.trim() &&
            !form.skills.trim() &&
            !form.college.trim()
        ) {
            setMessage("❌ Fill at least one field");
            setSaving(false);
            return;
        }

        const payload = {
            branch: form.branch.trim(),
            year: Number.isNaN(yearNum) ? null : yearNum,
            college: form.college.trim(),

            skills: form.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
        };

        try {
            const res = await fetch("/api/student", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                setMessage("❌ Failed to save profile");
                return;
            }

            setMessage("✅ Profile updated successfully");
        } catch (error) {
            console.error(error);
            setMessage("❌ Something went wrong");
        } finally {
            setSaving(false);
        }
    }
    if (status === "loading") {
        return (
            <div className="p-10 text-center">
                Checking session...
            </div>
        );
    }

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
                Loading profile...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow">

                <h1 className="text-3xl font-bold mb-6">
                    Student Profile 👤
                </h1>

                <p className="text-gray-500 mb-6">
                    Update your academic details and skills.
                </p>

                {/* NAV */}
                <div className="flex gap-3 mb-6">
                    <Link href="/student/dashboard" className="bg-gray-200 px-4 py-2 rounded-lg">
                        Dashboard
                    </Link>

                    <Link href="/student/listings" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                        Listings
                    </Link>

                    <Link href="/student/tracker" className="bg-green-500 text-white px-4 py-2 rounded-lg">
                        Tracker
                    </Link>
                </div>
                <div className="mb-6">
                    <p className="text-sm text-gray-500">
                        Complete your profile to improve application visibility 🚀
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* BRANCH */}
                    <input
                        type="text"
                        value={form.branch}
                        onChange={(e) =>
                            setForm({ ...form, branch: e.target.value })
                        }
                        placeholder="Branch (CSE)"
                        className="w-full border p-3 rounded-lg"
                    />

                    {/* YEAR */}
                    <input
                        type="number"
                        value={form.year}
                        onChange={(e) =>
                            setForm({ ...form, year: e.target.value })
                        }
                        placeholder="Year (e.g. 3)"
                        className="w-full border p-3 rounded-lg"
                    />

                    {/* SKILLS */}
                    <textarea
                        value={form.skills}
                        onChange={(e) =>
                            setForm({ ...form, skills: e.target.value })
                        }
                        placeholder="React, Node.js, AWS"
                        className="w-full border p-3 rounded-lg h-28"
                    />

                    {/* COLLEGE */}
                    <input
                        type="text"
                        value={form.college}
                        onChange={(e) =>
                            setForm({ ...form, college: e.target.value })
                        }
                        placeholder="College name"
                        className="w-full border p-3 rounded-lg"
                    />

                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={saving}
                        className={`w-full py-3 rounded-lg text-white ${saving
                            ? "bg-gray-400"
                            : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {saving ? "Saving..." : "Save Profile"}
                    </button>

                    {/* MESSAGE */}
                    {message && (
                        <p
                            className={`text-center text-sm font-medium ${message.includes("✅")
                                ? "text-green-600"
                                : "text-red-500"
                                }`}
                        >
                            {message}
                        </p>
                    )}

                </form>
            </div>
        </div>
    );
}