import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

    try {

        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        if (
            body.role !== "STUDENT" &&
            body.role !== "COMPANY"
        ) {
            return NextResponse.json(
                { error: "Invalid role" },
                { status: 400 }
            );
        }

        const user = await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                role: body.role,
            },
        });

        return NextResponse.json(user);

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            { error: "Failed to update role" },
            { status: 500 }
        );
    }
}