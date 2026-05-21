"use client";

import { useState } from "react";

export default function AddJobPage() {
    const [form, setForm] = useState({
        title: "",
        type: "INTERNSHIP",
        description: "",
        skills: "",
        location: "",
        deadline: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    function handleChange(e: any) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function submit(e: any) {
        e.preventDefault();

        // 🔥 validation
        if (!form.title || !form.description || !form.skills || !form.deadline) {
            setMessage("❌ Please fill all required fields");
            return;
        }

        setLoading(true);

        const res = await fetch("/api/listings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            setMessage("✅ Job added successfully");
            setForm({
                title: "",
                type: "INTERNSHIP",
                description: "",
                skills: "",
                location: "",
                deadline: "",
            });
        } else {
            setMessage("❌ Failed to add job");
        }

        setLoading(false);
    }

    return (
        <div>

            <h1 className="text-3xl font-bold mb-6">
                Add Opportunity ✍️
            </h1>

            <form
                onSubmit={submit}
                className="bg-white p-6 rounded-xl shadow space-y-4 max-w-xl"
            >

                <input
                    name="title"
                    placeholder="Job Title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full border p-3 rounded"
                />

                <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full border p-3 rounded"
                >
                    <option value="INTERNSHIP">Internship</option>
                    <option value="HACKATHON">Hackathon</option>
                </select>

                <textarea
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border p-3 rounded"
                />

                <input
                    name="skills"
                    placeholder="Skills (comma separated)"
                    value={form.skills}
                    onChange={handleChange}
                    className="w-full border p-3 rounded"
                />

                <input
                    name="location"
                    placeholder="Location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full border p-3 rounded"
                />

                <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                    className="w-full border p-3 rounded"
                />

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                >
                    {loading ? "Submitting..." : "Add Job"}
                </button>

                {message && (
                    <p className="text-sm text-center">{message}</p>
                )}
            </form>

        </div>
    );
}