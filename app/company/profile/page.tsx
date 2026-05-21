"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CompanyProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [name, setName] =
        useState("");

    const [loading, setLoading] =
        useState(false);
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [website, setWebsite] = useState("");
    useEffect(() => {

        if (status === "unauthenticated") {
            router.push("/login");
        }

        if (
            status === "authenticated" &&
            session?.user?.role !== "COMPANY"
        ) {
            router.push("/");
        }

    }, [session, status, router]);

    // FETCH COMPANY
    useEffect(() => {

        async function fetchCompany() {

            try {

                const res =
                    await fetch("/api/company");

                const data =
                    await res.json();

                if (data?.name) {
                    setName(data.name);
                    setDescription(data.description || "");
                    setLocation(data.location || "");
                    setWebsite(data.website || "");
                }

            } catch (error) {

                console.log(error);
            }
        }

        fetchCompany();

    }, []);

    // SAVE COMPANY
    async function handleSubmit(
        e: React.FormEvent
    ) {

        e.preventDefault();

        setLoading(true);

        try {

            const res = await fetch(
                "/api/company",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        name,
                        description,
                        location,
                        website,
                    }),
                }
            );

            const data =
                await res.json();

            if (res.ok) {

                alert("Company profile saved");

                // refresh session with new role
                window.location.href = "/company";

            } else {

                alert(
                    data.error ||
                    "Failed to save"
                );
            }

        } catch (error) {

            console.log(error);

            alert(
                "Something went wrong"
            );
        }

        setLoading(false);
    }
    if (status === "loading") {
        return (
            <div className="p-10 text-center">
                Loading...
            </div>
        );
    }
    return (

        <div className="max-w-2xl mx-auto">

            <h1 className="text-3xl font-bold mb-6">
                Company Profile
            </h1>

            <form
                onSubmit={handleSubmit}
                className="
          bg-white
          p-6
          rounded-2xl
          shadow
          space-y-5
        "
            >

                <div>

                    <label className="block mb-2 font-medium">
                        Company Name
                    </label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        required
                        placeholder="Google"
                        className="
              w-full
              border
              rounded-lg
              p-3
            "
                    />

                </div>
                <div>

                    <label className="block mb-2 font-medium">
                        Description
                    </label>

                    <textarea
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                        placeholder="About your company"
                        className="
            w-full
            border
            rounded-lg
            p-3
            h-32
        "
                    />

                </div>
                <div>

                    <label className="block mb-2 font-medium">
                        Location
                    </label>

                    <input
                        type="text"
                        value={location}
                        onChange={(e) =>
                            setLocation(e.target.value)
                        }
                        placeholder="Hyderabad"
                        className="
            w-full
            border
            rounded-lg
            p-3
        "
                    />

                </div>
                <div>

                    <label className="block mb-2 font-medium">
                        Website
                    </label>

                    <input
                        type="url"
                        value={website}
                        onChange={(e) =>
                            setWebsite(e.target.value)
                        }
                        placeholder="https://company.com"
                        className="
            w-full
            border
            rounded-lg
            p-3
        "
                    />

                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="
            bg-black
            text-white
            px-6
            py-3
            rounded-lg
          "
                >

                    {loading
                        ? "Saving..."
                        : "Save Company"}

                </button>

            </form>

        </div>
    );
}