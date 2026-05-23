import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { AppStatus } from "@prisma/client";
import { computeApplicationStats } from "@/lib/application-stats";
import {
  APP_STATUSES,
  normalizeAppStatus,
} from "@/lib/application-status";
import { ensureReviewingAppStatus } from "@/lib/ensure-app-status-enum";

// ======================
// GET APPLICATIONS
// ======================
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        if (session.user.role !== "STUDENT") {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        const student = await prisma.student.findUnique({
            where: {
                userId: session.user.id,
            },
        });

        if (!student) {
            return NextResponse.json({
                applications: [],
                stats: computeApplicationStats([]),
            });
        }

        const apps = await prisma.application.findMany({
            where: {
                studentId: student.id,
            },
            include: {
                listing: {
                    include: {
                        company: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({
            applications: apps,
            stats: computeApplicationStats(apps),
        });
    } catch (error) {
        console.error("GET applications error:", error);

        return NextResponse.json(
            { error: "Failed to fetch applications" },
            { status: 500 }
        );
    }
}

// ======================
// CREATE APPLICATION
// ======================
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // ROLE CHECK (IMPORTANT FIX)
        if (session.user.role !== "STUDENT") {
            return NextResponse.json(
                { error: "Only students can apply" },
                { status: 403 }
            );
        }

        const body = await req.json();

        if (!body.listingId) {
            return NextResponse.json(
                { error: "Listing ID required" },
                { status: 400 }
            );
        }

        const student = await prisma.student.findUnique({
            where: {
                userId: session.user.id,
            },
        });

        if (!student) {
            return NextResponse.json(
                { error: "Student not found" },
                { status: 404 }
            );
        }

        const listing = await prisma.listing.findUnique({
            where: {
                id: body.listingId,
            },
        });

        if (!listing) {
            return NextResponse.json(
                { error: "Listing not found" },
                { status: 404 }
            );
        }
        if (listing.deadline) {
            const deadline = new Date(listing.deadline);
            if (
                !Number.isNaN(deadline.getTime()) &&
                deadline.getTime() < Date.now()
            ) {
                return NextResponse.json(
                    { error: "Application deadline passed" },
                    { status: 400 }
                );
            }
        }
        const existing = await prisma.application.findFirst({
            where: {
                studentId: student.id,
                listingId: body.listingId,
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Already applied" },
                { status: 400 }
            );
        }

        const app = await prisma.application.create({
            data: {
                studentId: student.id,
                listingId: body.listingId,
                status: "APPLIED",
            },
        });

        return NextResponse.json(app);
    } catch (error) {
        console.error("POST applications error:", error);

        return NextResponse.json(
            { error: "Failed to apply" },
            { status: 500 }
        );
    }
}

// ======================
// UPDATE STATUS
// ======================
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (session.user.role !== "COMPANY") {
            return NextResponse.json(
                { error: "Only companies can update status" },
                { status: 403 }
            );
        }
        const body = await req.json();

        if (!body.id || body.status === undefined || body.status === null) {
            return NextResponse.json(
                { error: "Missing fields" },
                { status: 400 }
            );
        }

        const status = normalizeAppStatus(body.status);

        if (!status) {
            return NextResponse.json(
                {
                    error: "Invalid status",
                    allowed: APP_STATUSES,
                    received: body.status,
                },
                { status: 400 }
            );
        }

        const application = await prisma.application.findUnique({
            where: { id: body.id },
            include: { listing: true },
        });

        if (!application) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }



        const company = await prisma.company.findUnique({
            where: { userId: session.user.id },
        });

        if (!company || application.listing.companyId !== company.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        if (status === "REVIEWING") {
            const enumCheck = await ensureReviewingAppStatus(prisma);
            if (!enumCheck.ok) {
                return NextResponse.json(
                    {
                        error:
                            "Database is missing REVIEWING status. Run: npm run db:fix-reviewing",
                        details: enumCheck.error,
                        hint: "Use your Neon direct (non-pooler) connection string in DIRECT_URL, or run scripts/ensure-reviewing-enum.sql in the Neon SQL editor.",
                    },
                    { status: 503 }
                );
            }
        }

        const updated = await prisma.application.update({
            where: {
                id: body.id,
            },
            data: {
                status: status as AppStatus,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("PATCH applications error:", error);

        const message =
            error instanceof Error ? error.message : "Unknown error";

        if (
            message.includes("REVIEWING") ||
            message.includes("invalid input value for enum")
        ) {
            return NextResponse.json(
                {
                    error:
                        "REVIEWING status is not in the database yet. Run: npx prisma migrate deploy",
                    details: message,
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update status", details: message },
            { status: 500 }
        );
    }
}