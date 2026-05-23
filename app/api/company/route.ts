import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "COMPANY") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
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

    return NextResponse.json(company);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "COMPANY") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    const company = await prisma.company.upsert({
      where: { userId: session.user.id },
      update: {
        name,
        description: body.description?.trim() || null,
        location: body.location?.trim() || null,
        website: body.website?.trim() || null,
      },
      create: {
        userId: session.user.id,
        name,
        description: body.description?.trim() || null,
        location: body.location?.trim() || null,
        website: body.website?.trim() || null,
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save company" },
      { status: 500 }
    );
  }
}
