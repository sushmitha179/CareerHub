import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET → fetch listings
export async function GET() {
    try {
        const listings = await prisma.listing.findMany({
            where: {
                OR: [
                    {
                        deadline: null,
                    },
                    {
                        deadline: {
                            gte: new Date(),
                        },
                    },
                ],
            },

            include: {
                company: true,
            },

            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(listings);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Error fetching listings" },
            { status: 500 }
        );
    }
}

// POST → create listing (COMPANY ONLY)
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "COMPANY") {
            return NextResponse.json(
                { error: "Only companies can create listings" },
                { status: 403 }
            );
        }

        const body = await req.json();

        if (
            !body.title ||
            !body.type ||
            !body.description ||
            !body.skills ||
            !body.deadline
        ) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }
        const title = body.title?.trim();
        const description = body.description?.trim();
        const location = body.location?.trim();
        const validTypes = [
            "INTERNSHIP",
            "JOB",
            "HACKATHON",
        ];

        if (!validTypes.includes(body.type)) {
            return NextResponse.json(
                { error: "Invalid listing type" },
                { status: 400 }
            );
        }
        if (new Date(body.deadline) < new Date()) {
            return NextResponse.json(
                { error: "Deadline cannot be in the past" },
                { status: 400 }
            );
        }

        const company = await prisma.company.findUnique({
            where: { userId: session.user.id },
        });

        if (!company) {
            return NextResponse.json(
                { error: "Company not found" },
                { status: 404 }
            );
        }

        const listing = await prisma.listing.create({
            data: {
                title,
                companyId: company.id,
                type: body.type,
                description,
                skills: Array.isArray(body.skills)
                    ? body.skills
                        .map((s: string) => s.trim())
                        .filter(Boolean)
                    : typeof body.skills === "string"
                        ? body.skills
                            .split(",")
                            .map((s: string) => s.trim())
                            .filter(Boolean)
                        : [],
                location: location || "Remote",
                deadline: new Date(body.deadline),
            },
        });

        return NextResponse.json({
            message: "Listing created successfully",
            listing,
        });

    } catch (error) {
        console.error("CREATE LISTING ERROR:", error);

        return NextResponse.json(
            { error: "Failed to create listing" },
            { status: 500 }
        );
    }
}
