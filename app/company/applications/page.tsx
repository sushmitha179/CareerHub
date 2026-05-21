"use client";

import { useEffect, useState } from "react";

export default function CompanyApplicationsPage() {

    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function fetchApplications() {

            try {

                const res = await fetch("/api/company/applications");

                const data = await res.json();

                setApplications(Array.isArray(data) ? data : []);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);
            }
        }

        fetchApplications();

    }, []);

    if (loading) {
        return (
            <div className="p-10 text-center">
                Loading applications...
            </div>
        );
    }

    return (
        <div className="p-6">

            <h1 className="text-4xl font-bold mb-8">
                Applications 📄
            </h1>

            {applications.length === 0 ? (

                <div className="bg-white p-6 rounded-2xl shadow">
                    No applications yet.
                </div>

            ) : (

                <div className="grid gap-6">

                    {applications.map((app) => (

                        <div
                            key={app.id}
                            className="bg-white p-6 rounded-2xl shadow"
                        >

                            <div className="flex justify-between items-start mb-4">

                                <div>

                                    <h2 className="text-2xl font-bold">
                                        {app.student?.user?.name}
                                    </h2>

                                    <p className="text-gray-500">
                                        {app.student?.user?.email}
                                    </p>

                                </div>

                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                    {app.status}
                                </span>

                            </div>

                            <div className="space-y-2">

                                <p>
                                    <span className="font-semibold">
                                        Applied For:
                                    </span>{" "}
                                    {app.listing?.title}
                                </p>

                                <p>
                                    <span className="font-semibold">
                                        College:
                                    </span>{" "}
                                    {app.student?.college || "N/A"}
                                </p>

                                <p>
                                    <span className="font-semibold">
                                        Branch:
                                    </span>{" "}
                                    {app.student?.branch || "N/A"}
                                </p>

                                <p>
                                    <span className="font-semibold">
                                        Skills:
                                    </span>{" "}
                                    {app.student?.skills?.join(", ")}
                                </p>

                            </div>

                            {app.student?.resumeUrl && (

                                <a
                                    href={app.student.resumeUrl}
                                    target="_blank"
                                    className="inline-block mt-4 bg-green-500 text-white px-4 py-2 rounded-lg"
                                >
                                    View Resume
                                </a>

                            )}

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}