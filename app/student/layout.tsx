"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
    {
        name: "Dashboard",
        href: "/student/dashboard",
    },
    {
        name: "Listings",
        href: "/student/listings",
    },
    {
        name: "Tracker",
        href: "/student/tracker",
    },
    {
        name: "Profile",
        href: "/student/profile",
    },
];

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const path = usePathname();

    return (
        <div className="flex min-h-screen bg-gray-100">

            {/* SIDEBAR */}
            <aside className="w-64 bg-white shadow-lg p-5">

                <h2 className="text-2xl font-bold mb-8">
                    CareerHub 🎓
                </h2>

                {/* NAVIGATION */}
                <nav className="space-y-3">

                    {navItems.map((item) => (

                        <Link
                            key={item.href}
                            href={item.href}
                            className={`block px-4 py-3 rounded-lg transition ${path === item.href
                                ? "bg-blue-500 text-white"
                                : "hover:bg-gray-200"
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}

                </nav>

                {/* LOGOUT */}
                <button
                    onClick={() =>
                        signOut({
                            callbackUrl: "/",
                        })
                    }
                    className="
            w-full
            mt-10
            bg-red-500
            hover:bg-red-600
            text-white
            py-3
            rounded-lg
            transition
          "
                >
                    Logout
                </button>

            </aside>

            {/* PAGE CONTENT */}
            <main className="flex-1 p-6">
                {children}
            </main>

        </div>
    );
}