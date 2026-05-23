"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { dashboardPath } from "@/lib/routes";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) return;

    if (!session.user.role) {
      router.replace("/select-role");
      return;
    }

    router.replace(dashboardPath(session.user.role));
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 px-6">
      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 text-center">
        CareerHub 🚀
      </h1>

      <p className="mt-4 text-lg text-gray-600 text-center max-w-2xl">
        Discover internships, hackathons, and career opportunities — all in one
        platform.
      </p>

      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl shadow-lg transition"
      >
        Sign in with Google
      </button>

      <div className="mt-16 grid md:grid-cols-3 gap-6 w-full max-w-5xl">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-xl font-semibold">📌 Listings</h3>
          <p className="text-gray-600 mt-2">
            Explore internships & hackathons in one place.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-xl font-semibold">📊 Tracker</h3>
          <p className="text-gray-600 mt-2">
            Track your applications and progress easily.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-xl font-semibold">🏢 Company Portal</h3>
          <p className="text-gray-600 mt-2">
            Companies can post jobs and manage applications.
          </p>
        </div>
      </div>
    </div>
  );
}
