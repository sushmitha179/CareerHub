import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET student profile
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

        return NextResponse.json(student);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

// CREATE / UPDATE profile
export async function POST(req: Request) {
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

        const body = await req.json();
        const year = Number(body.year);

        if (
            body.year &&
            (isNaN(year) || year < 1 || year > 5)
        ) {
            return NextResponse.json(
                { error: "Invalid academic year" },
                { status: 400 }
            );
        }
        let skills: string[] = [];

        if (Array.isArray(body.skills)) {
            skills = Array.from(
                new Set<string>(
                    body.skills
                        .map((s: string) => s.trim())
                        .filter((s: string) => s.length > 0)
                )
            );
        } else if (typeof body.skills === "string") {
            skills = Array.from(
                new Set<string>(
                    body.skills
                        .split(",")
                        .map((s: string) => s.trim())
                        .filter((s: string) => s.length > 0)
                )
            );
        }
        const student = await prisma.student.upsert({
            where: {
                userId: session.user.id,
            },
            update: {
                branch: body.branch,
                year: body.year ? year : null,
                skills,
                college: body.college,
            },
            create: {
                userId: session.user.id,
                branch: body.branch,
                year: body.year ? year : null,
                skills,
                college: body.college,
            },
        });

        return NextResponse.json(student);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to save profile" },
            { status: 500 }
        );
    }
}