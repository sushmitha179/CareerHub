"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useStudentApplications } from "@/lib/hooks/use-student-applications";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const enabled = status === "authenticated" && session?.user?.role === "STUDENT";
  const { stats, loading } = useStudentApplications(enabled);

  if (status === "loading") {
    return (
      <div className="p-10 text-center">Loading dashboard...</div>
    );
  }

  if (!session) {
    return (
      <div className="p-10 text-center">Unauthorized Access</div>
    );
  }

  if (session.user.role !== "STUDENT") {
    return <div className="p-10 text-center">Access Denied</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Student Dashboard 🎓</h1>
        <p className="text-gray-600 mt-2">
          Welcome back {session.user.name}
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500">Applications</p>
          <h2 className="text-3xl font-bold mt-2">
            {loading ? "..." : stats.total}
          </h2>
          {stats.total === 0 && !loading && (
            <p className="text-gray-500 mt-2 text-sm">
              Start applying to opportunities 🚀
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500">Interviewing</p>
          <h2 className="text-3xl font-bold mt-2">
            {loading ? "..." : stats.INTERVIEWING}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500">Offers</p>
          <h2 className="text-3xl font-bold mt-2 text-green-600">
            {loading ? "..." : stats.OFFERED}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500">Success Rate</p>
          <h2 className="text-3xl font-bold mt-2 text-green-600">
            {loading ? "..." : `${stats.successRate}%`}
          </h2>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/student/listings">
          <div className="bg-blue-500 text-white p-6 rounded-2xl shadow hover:scale-105 transition cursor-pointer h-full">
            <h2 className="text-xl font-bold mb-2">Browse Listings</h2>
            <p className="text-sm opacity-90">Explore internships & hackathons</p>
          </div>
        </Link>

        <Link href="/student/tracker">
          <div className="bg-green-500 text-white p-6 rounded-2xl shadow hover:scale-105 transition cursor-pointer h-full">
            <h2 className="text-xl font-bold mb-2">Application Tracker</h2>
            <p className="text-sm opacity-90">
              {loading
                ? "Track your applications"
                : `${stats.REJECTED} rejected · ${stats.REVIEWING} reviewing`}
            </p>
          </div>
        </Link>

        <Link href="/student/analyzer">
          <div className="bg-indigo-500 text-white p-6 rounded-2xl shadow hover:scale-105 transition cursor-pointer h-full">
            <h2 className="text-xl font-bold mb-2">Resume Analyzer</h2>
            <p className="text-sm opacity-90">Skill gaps & AI feedback</p>
          </div>
        </Link>

        <Link href="/student/profile">
          <div className="bg-purple-500 text-white p-6 rounded-2xl shadow hover:scale-105 transition cursor-pointer h-full">
            <h2 className="text-xl font-bold mb-2">My Profile</h2>
            <p className="text-sm opacity-90">Update your student profile</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
