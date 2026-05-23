"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";


export default function PostJobPage() {

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");


    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {

        e.preventDefault();

        if (loading) return;

        setLoading(true);
        setMessage("");

        const form = e.currentTarget;

        const formData = new FormData(form);

        const skillsRaw =
            formData.get("skills")?.toString() || "";

        const data = {
            title:
                formData.get("title")
                    ?.toString()
                    .trim(),

            description:
                formData.get("description")
                    ?.toString()
                    .trim(),

            type:
                formData.get("type"),

            location:
                formData.get("location")
                    ?.toString()
                    .trim(),

            deadline:
                formData.get("deadline")
                    ?.toString(),

            skills: skillsRaw
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
        };

        if (
            !data.title ||
            !data.description ||
            !data.location
        ) {
            setMessage("Please fill all fields ❌");
            setLoading(false);
            return;
        }

        try {

            const res = await fetch(
                "/api/listings",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify(data),
                }
            );

            const result = await res.json();

            if (!res.ok) {

                setMessage(
                    result.error ||
                    "Failed to post job ❌"
                );

                return;
            }

            setMessage(
                "Job posted successfully ✅"
            );

            form.reset();

            setTimeout(() => {
                router.push(
                    "/company/dashboard"
                );
            }, 1500);

        } catch (error) {

            console.error(error);

            setMessage(
                "Something went wrong ❌"
            );

        } finally {

            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto">

            <h1 className="text-3xl font-bold mb-6">
                Post New Job 🚀
            </h1>

            {/* MESSAGE */}
            {message && (
                <div
                    className={`mb-4 p-3 rounded text-sm ${message.includes("successfully")
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                >
                    {message}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                autoComplete="off"
                className="bg-white p-6 rounded-2xl shadow space-y-5"
            >

                <input
                    type="text"
                    name="title"
                    required
                    placeholder="Job Title"
                    className="w-full border rounded-lg p-3"
                />

                <textarea
                    name="description"
                    required
                    placeholder="Job Description"
                    className="w-full border rounded-lg p-3 h-32"
                />

                <input
                    type="text"
                    name="skills"
                    required
                    placeholder="React, Next.js, AWS"
                    className="w-full border rounded-lg p-3"
                />

                <select
                    name="type"
                    className="w-full border rounded-lg p-3"
                >
                    <option value="INTERNSHIP">Internship</option>
                    <option value="HACKATHON">Hackathon</option>
                    <option value="JOB">Job</option>
                </select>

                <input
                    type="text"
                    name="location"
                    placeholder="Remote"
                    className="w-full border rounded-lg p-3"
                />

                <input
                    type="date"
                    name="deadline"
                    required
                    className="w-full border rounded-lg p-3"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 rounded-lg text-white transition ${loading
                        ? "bg-gray-500"
                        : "bg-black hover:bg-gray-800"
                        }`}
                >
                    {loading ? "Posting..." : "Post Job"}
                </button>

            </form>
        </div>
    );
}