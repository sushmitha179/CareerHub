"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CompanyDashboard() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                const [listRes, appRes] = await Promise.all([
                    fetch("/api/company/post"),
                    fetch("/api/company/applications"),
                ]);

                if (!listRes.ok || !appRes.ok) {
                    console.error("Failed to load company data");
                    return;
                }

                const listings = await listRes.json();
                const apps = await appRes.json();

                setJobs(Array.isArray(listings) ? listings : []);
                setApplications(Array.isArray(apps) ? apps : []);
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="p-10 text-center text-gray-500">
                Loading company dashboard...
            </div>
        );
    }

    // COMPUTED STATS
    const totalJobs = jobs.length;

    const totalApplications = applications.length;

    const activeListings = jobs.filter(
        (job) => new Date(job.deadline) > new Date()
    ).length;

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold">
                    Company Dashboard 🏢
                </h1>

                <p className="text-gray-600 mt-2">
                    Manage listings and applications
                </p>
            </div>

            {/* STATS */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">

                <div className="bg-white p-6 rounded-2xl shadow">
                    <p className="text-gray-500">Total Jobs</p>
                    <h2 className="text-3xl font-bold mt-2">
                        {totalJobs}
                    </h2>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow">
                    <p className="text-gray-500">Applications</p>
                    <h2 className="text-3xl font-bold mt-2">
                        {totalApplications}
                    </h2>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow">
                    <p className="text-gray-500">Active Listings</p>
                    <h2 className="text-3xl font-bold mt-2">
                        {activeListings}
                    </h2>
                </div>

            </div>

            {/* ACTIONS */}
            <div className="grid md:grid-cols-2 gap-6">

                <Link href="/company/post">
                    <div className="bg-blue-500 text-white p-6 rounded-2xl shadow hover:scale-105 transition cursor-pointer">
                        <h2 className="text-2xl font-bold mb-2">
                            Post New Job
                        </h2>
                        <p>Create internships & hackathons</p>
                    </div>
                </Link>

                <Link href="/company/applications">
                    <div className="bg-green-500 text-white p-6 rounded-2xl shadow hover:scale-105 transition cursor-pointer">
                        <h2 className="text-2xl font-bold mb-2">
                            View Applications
                        </h2>
                        <p>Manage student applications</p>
                    </div>
                </Link>

            </div>

        </div>
    );
}