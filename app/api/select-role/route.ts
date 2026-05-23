import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import {
  assignUserRole,
  RoleAlreadySetError,
} from "@/lib/role-assignment";
import { dashboardPath } from "@/lib/routes";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.role !== "STUDENT" && body.role !== "COMPANY") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await assignUserRole(
      session.user.id,
      body.role as Role
    );

    return NextResponse.json({
      id: user.id,
      role: user.role,
      redirectTo: dashboardPath(user.role),
    });
  } catch (error) {
    if (error instanceof RoleAlreadySetError) {
      const session = await getServerSession(authOptions);
      return NextResponse.json(
        {
          error: "Role already set",
          redirectTo: dashboardPath(session?.user?.role),
        },
        { status: 409 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
