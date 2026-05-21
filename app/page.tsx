"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {

  const { data: session, status } =
    useSession();

  const router = useRouter();

  // AUTO REDIRECT
  useEffect(() => {

    if (status === "loading") return;

    if (session?.user && !session.user.role) {
      router.push("/select-role");
    }

    if (session?.user?.role === "STUDENT") {
      router.push("/student/dashboard");
    }

    if (session?.user?.role === "COMPANY") {
      router.push("/company/dashboard");
    }

  }, [session, status, router]);

  // LOADING
  if (status === "loading") {

    return (
      <div className="
        min-h-screen
        flex
        items-center
        justify-center
      ">
        Loading...
      </div>
    );
  }

  return (
    <div className="
      min-h-screen
      flex
      flex-col
      items-center
      justify-center
      bg-gradient-to-br
      from-blue-50
      to-purple-100
      px-6
    ">

      {/* HERO */}
      <h1 className="
        text-5xl
        md:text-6xl
        font-extrabold
        text-gray-800
        text-center
      ">
        CareerHub 🚀
      </h1>

      <p className="
        mt-4
        text-lg
        text-gray-600
        text-center
        max-w-2xl
      ">
        Discover internships,
        hackathons, and career
        opportunities —
        all in one platform.
      </p>

      {/* LOGIN BUTTON */}
      {!session && (

        <button
          onClick={() =>
            signIn("google")
          }
          className="
            mt-8
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-8
            py-4
            rounded-2xl
            shadow-lg
            transition
          "
        >
          Sign in with Google
        </button>
      )}

      {/* FEATURES */}
      <div className="
        mt-16
        grid
        md:grid-cols-3
        gap-6
        w-full
        max-w-5xl
      ">

        {/* CARD 1 */}
        <div className="
          bg-white
          p-6
          rounded-2xl
          shadow
        ">
          <h3 className="
            text-xl
            font-semibold
          ">
            📌 Listings
          </h3>

          <p className="
            text-gray-600
            mt-2
          ">
            Explore internships &
            hackathons in one place.
          </p>
        </div>

        {/* CARD 2 */}
        <div className="
          bg-white
          p-6
          rounded-2xl
          shadow
        ">
          <h3 className="
            text-xl
            font-semibold
          ">
            📊 Tracker
          </h3>

          <p className="
            text-gray-600
            mt-2
          ">
            Track your applications
            and progress easily.
          </p>
        </div>

        {/* CARD 3 */}
        <div className="
          bg-white
          p-6
          rounded-2xl
          shadow
        ">
          <h3 className="
            text-xl
            font-semibold
          ">
            🏢 Company Portal
          </h3>

          <p className="
            text-gray-600
            mt-2
          ">
            Companies can post jobs
            and manage applications.
          </p>
        </div>

      </div>
    </div>
  );
}