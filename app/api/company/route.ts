import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

// GET COMPANY
export async function GET() {

    try {

        const session =
            await getServerSession(authOptions);

        if (!session?.user?.id) {

            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const company =
            await prisma.company.findUnique({
                where: {
                    userId: session.user.id,
                },
            });

        if (!company) {
            return Response.json(
                { error: "Company not found" },
                { status: 404 }
            );
        }

        return Response.json(company);

    } catch (error) {

        console.log(error);

        return Response.json(
            { error: "Failed to fetch company" },
            { status: 500 }
        );
    }
}

// CREATE / UPDATE COMPANY
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const name = body.name?.trim();

        if (!name) {
            return Response.json(
                { error: "Company name is required" },
                { status: 400 }
            );
        }

        const company = await prisma.company.upsert({
            where: {
                userId: session.user.id,
            },

            update: {
                name: name,
                description: body.description?.trim() || null,
                location: body.location?.trim() || null,
                website: body.website?.trim() || null,
            },

            create: {
                userId: session.user.id,
                name: name,
                description: body.description?.trim() || null,
                location: body.location?.trim() || null,
                website: body.website?.trim() || null,
            },
        });

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                role: Role.COMPANY,
            },
        });

        return Response.json(company);

    } catch (error) {
        console.log(error);

        return Response.json(
            { error: "Failed to save company" },
            { status: 500 }
        );
    }
}