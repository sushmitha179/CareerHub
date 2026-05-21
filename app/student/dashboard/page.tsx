"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [appsCount, setAppsCount] = useState(0);
    const [loadingApps, setLoadingApps] = useState(true);

    useEffect(() => {
        if (status !== "authenticated") return;

        const fetchApplications = async () => {
            try {
                setLoadingApps(true);

                const res = await fetch("/api/applications");

                if (!res.ok) {
                    console.error("Failed to fetch applications");
                    setAppsCount(0);
                    return;
                }

                const data = await res.json();

                if (Array.isArray(data)) {
                    setAppsCount(data.length);
                }
            } catch (error) {
                console.error("Dashboard fetch error:", error);
                setAppsCount(0);
            } finally {
                setLoadingApps(false);
            }
        };

        fetchApplications();
    }, [status]);

    if (status === "loading") {
        return (
            <div className="p-10 text-center">
                Loading dashboard...
            </div>
        );
    }
    if (!session) {
        return (
            <div className="p-10 text-center">
                Unauthorized Access
            </div>
        );
    }
    if (session.user.role !== "STUDENT") {
        return (
            <div className="p-10 text-center">
                Access Denied
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold">
                    Student Dashboard 🎓
                </h1>

                <p className="text-gray-600 mt-2">
                    Welcome back {session.user.name}
                </p>
            </div>

            {/* STATS */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow">
                    <p className="text-gray-500">Applications</p>

                    <h2 className="text-3xl font-bold mt-2">
                        {loadingApps ? "..." : appsCount}
                    </h2>
                    {appsCount === 0 && !loadingApps && (
                        <p className="text-gray-500 mt-2">
                            Start applying to opportunities 🚀
                        </p>
                    )}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow">
                    <p className="text-gray-500">Interviews</p>
                    <h2 className="text-3xl font-bold mt-2">0</h2>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow">
                    <p className="text-gray-500">Offers</p>
                    <h2 className="text-3xl font-bold mt-2">0</h2>
                </div>
            </div>

            {/* ACTIONS */}
            <div className="grid md:grid-cols-3 gap-6">
                <Link href="/student/listings">
                    <div className="bg-blue-500 text-white p-6 rounded-2xl shadow hover:scale-105 transition cursor-pointer">
                        <h2 className="text-2xl font-bold mb-2">
                            Browse Listings
                        </h2>
                        <p>Explore internships & hackathons</p>
                    </div>
                </Link>

                <Link href="/student/tracker">
                    <div className="bg-green-500 text-white p-6 rounded-2xl shadow hover:scale-105 transition cursor-pointer">
                        <h2 className="text-2xl font-bold mb-2">
                            Application Tracker
                        </h2>
                        <p>Track all your applications</p>
                    </div>
                </Link>

                <Link href="/student/profile">
                    <div className="bg-purple-500 text-white p-6 rounded-2xl shadow hover:scale-105 transition cursor-pointer">
                        <h2 className="text-2xl font-bold mb-2">
                            My Profile
                        </h2>
                        <p>Update your student profile</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}