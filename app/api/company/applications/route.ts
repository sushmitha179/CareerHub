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
                { error: "Access denied" },
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

        const applications = await prisma.application.findMany({
            where: {
                listing: {
                    companyId: company.id,
                },
            },

            select: {
                id: true,
                status: true,
                createdAt: true,
                student: {
                    select: {
                        id: true,
                        branch: true,
                        year: true,
                        college: true,
                        skills: true,
                        resumeUrl: true,

                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                },

                listing: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        location: true,
                        deadline: true,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(applications);

    } catch (error) {
        console.error("COMPANY_APPLICATIONS_ERROR:", error);

        return NextResponse.json(
            { error: "Failed to fetch applications" },
            { status: 500 }
        );
    }
}