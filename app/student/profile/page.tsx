"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ResumeUpload from "@/components/student/ResumeUpload";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [form, setForm] = useState({
    branch: "",
    year: "",
    skills: "",
    college: "",
  });
  const [resumeMeta, setResumeMeta] = useState({
    hasResume: false,
    resumeFileName: null as string | null,
    resumeUploadedAt: null as string | null,
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
          setResumeMeta({
            hasResume: Boolean(data.resumeUrl),
            resumeFileName: data.resumeFileName ?? null,
            resumeUploadedAt: data.resumeUploadedAt ?? null,
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

    const yearNum = Number(form.year);
    if (yearNum && (yearNum < 1 || yearNum > 5)) {
      setMessage("Invalid academic year");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setMessage("Failed to save profile");
        return;
      }
      setMessage("Profile updated successfully");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="p-10 text-center text-gray-500">Loading profile...</div>
    );
  }

  if (status === "unauthenticated") {
    return <div className="p-10 text-center">Please login first</div>;
  }

  if (session?.user?.role !== "STUDENT") {
    return <div className="p-10 text-center">Access Denied</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Student Profile</h1>
        <p className="text-gray-500 mt-2">
          Manage your resume and academic details for applications.
        </p>
      </div>

      <ResumeUpload
        initial={resumeMeta}
        onChange={(m) =>
          setResumeMeta({
            hasResume: m.hasResume,
            resumeFileName: m.resumeFileName ?? null,
            resumeUploadedAt: m.resumeUploadedAt ?? null,
          })
        }
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow space-y-5"
      >
        <h2 className="text-lg font-semibold">Academic details</h2>

        <input
          type="text"
          value={form.branch}
          onChange={(e) => setForm({ ...form, branch: e.target.value })}
          placeholder="Branch (e.g. CSE)"
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="number"
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
          placeholder="Year (e.g. 3)"
          className="w-full border p-3 rounded-lg"
        />

        <textarea
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
          placeholder="Skills (comma separated): React, Node.js"
          className="w-full border p-3 rounded-lg h-28"
        />

        <input
          type="text"
          value={form.college}
          onChange={(e) => setForm({ ...form, college: e.target.value })}
          placeholder="College name"
          className="w-full border p-3 rounded-lg"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>

        {message && (
          <p
            className={`text-center text-sm ${
              message.includes("success")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
