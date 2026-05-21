"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {

    const { data: session } = useSession();

    return (

        <nav className="bg-black text-white px-6 py-4 shadow-md">

            <div className="max-w-7xl mx-auto flex justify-between items-center">

                {/* LOGO */}
                <Link
                    href="/"
                    className="text-2xl font-bold hover:text-gray-300 transition"
                >
                    CareerHub
                </Link>

                {/* NAV LINKS */}
                <div className="flex gap-5 items-center text-sm md:text-base">

                    {/* HOME */}
                    {!session && (
                        <Link
                            href="/"
                            className="hover:text-gray-300 transition"
                        >
                            Home
                        </Link>
                    )}

                    {/* STUDENT LINKS */}
                    {session?.user?.role === "STUDENT" && (
                        <>
                            <Link
                                href="/student/dashboard"
                                className="hover:text-gray-300 transition"
                            >
                                Dashboard
                            </Link>

                            <Link
                                href="/student/listings"
                                className="hover:text-gray-300 transition"
                            >
                                Listings
                            </Link>

                            <Link
                                href="/student/tracker"
                                className="hover:text-gray-300 transition"
                            >
                                Tracker
                            </Link>

                            <Link
                                href="/student/profile"
                                className="hover:text-gray-300 transition"
                            >
                                Profile
                            </Link>
                        </>
                    )}

                    {/* COMPANY LINKS */}
                    {session?.user?.role === "COMPANY" && (
                        <>
                            <Link
                                href="/company/dashboard"
                                className="hover:text-gray-300 transition"
                            >
                                Dashboard
                            </Link>

                            <Link
                                href="/company/post"
                                className="hover:text-gray-300 transition"
                            >
                                Post Job
                            </Link>

                            <Link
                                href="/company/applications"
                                className="hover:text-gray-300 transition"
                            >
                                Applications
                            </Link>

                            <Link
                                href="/company/profile"
                                className="hover:text-gray-300 transition"
                            >
                                Profile
                            </Link>
                        </>
                    )}

                    {/* LOGOUT */}
                    {session && (
                        <button
                            onClick={() =>
                                signOut({
                                    callbackUrl: "/",
                                })
                            }
                            className="
                                bg-red-500
                                hover:bg-red-600
                                px-4
                                py-2
                                rounded-lg
                                transition
                            "
                        >
                            Logout
                        </button>
                    )}

                </div>

            </div>
        </nav>
    );
}