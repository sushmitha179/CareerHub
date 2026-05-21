"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SelectRolePage() {

    const router = useRouter();

    const [loading, setLoading] = useState(false);

    async function selectRole(role: "STUDENT" | "COMPANY") {

        try {

            setLoading(true);

            const res = await fetch("/api/select-role", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role }),
            });

            if (!res.ok) {
                alert("Failed to select role");
                return;
            }

            if (role === "STUDENT") {
                router.push("/student/dashboard");
            } else {
                router.push("/company/dashboard");
            }

            router.refresh();

        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center">

                <h1 className="text-3xl font-bold mb-4">
                    Select Your Role
                </h1>

                <p className="text-gray-500 mb-8">
                    Choose how you want to use CareerHub
                </p>

                <div className="space-y-4">

                    <button
                        disabled={loading}
                        onClick={() => selectRole("STUDENT")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
                    >
                        Continue as Student 🎓
                    </button>

                    <button
                        disabled={loading}
                        onClick={() => selectRole("COMPANY")}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl"
                    >
                        Continue as Company 🏢
                    </button>

                </div>

            </div>
        </div>
    );
}