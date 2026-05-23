"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { dashboardPath } from "@/lib/routes";

const navItems = [
  { name: "Dashboard", href: "/company/dashboard" },
  { name: "Post Job", href: "/company/post" },
  { name: "Applications", href: "/company/applications" },
  { name: "Profile", href: "/company/profile" },
];

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (!session?.user?.role) {
      router.replace("/select-role");
      return;
    }

    if (session.user.role !== "COMPANY") {
      router.replace(dashboardPath(session.user.role));
    }
  }, [status, session, router]);

  if (status === "loading" || !session?.user?.role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (session.user.role !== "COMPANY") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg p-5">
        <h2 className="text-2xl font-bold mb-8">Company Panel 🏢</h2>

        <nav className="space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg transition ${
                path === item.href
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-10 w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
