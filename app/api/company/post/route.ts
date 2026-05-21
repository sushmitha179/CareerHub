import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
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
                { error: "Only companies allowed" },
                { status: 403 }
            );
        }

        const company = await prisma.company.findUnique({
            where: {
                userId: session.user.id,
            },
        });

        if (!company) {
            return NextResponse.json(
                { error: "Company not found" },
                { status: 404 }
            );
        }

        const posts = await prisma.listing.findMany({
            where: {
                companyId: company.id,
            },

            include: {
                applications: true,
            },

            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(posts);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to fetch company posts" },
            { status: 500 }
        );
    }
}