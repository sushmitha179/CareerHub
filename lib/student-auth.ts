import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireStudentSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized" as const, status: 401 as const };
  }

  if (session.user.role !== "STUDENT") {
    return { error: "Access denied" as const, status: 403 as const };
  }

  return { session, userId: session.user.id };
}

export async function getStudentByUserId(userId: string) {
  return prisma.student.findUnique({ where: { userId } });
}
