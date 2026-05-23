"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { dashboardPath } from "@/lib/routes";

export default function SelectRolePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (session?.user?.role) {
      router.replace(dashboardPath(session.user.role));
    }
  }, [status, session, router]);

  async function selectRole(role: "STUDENT" | "COMPANY") {
    try {
      setLoading(true);

      const res = await fetch("/api/select-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (res.status === 409 && data.redirectTo) {
        await update();
        router.replace(data.redirectTo);
        return;
      }

      if (!res.ok) {
        alert(data.error || "Failed to select role");
        return;
      }

      await update();
      router.replace(data.redirectTo || dashboardPath(role));
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || session?.user?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">Select Your Role</h1>

        <p className="text-gray-500 mb-8">
          Choose how you want to use CareerHub
        </p>

        <div className="space-y-4">
          <button
            disabled={loading}
            onClick={() => selectRole("STUDENT")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl disabled:opacity-50"
          >
            Continue as Student 🎓
          </button>

          <button
            disabled={loading}
            onClick={() => selectRole("COMPANY")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl disabled:opacity-50"
          >
            Continue as Company 🏢
          </button>
        </div>
      </div>
    </div>
  );
}
