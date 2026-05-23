import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class RoleAlreadySetError extends Error {
  constructor() {
    super("ROLE_ALREADY_SET");
    this.name = "RoleAlreadySetError";
  }
}

export async function assignUserRole(userId: string, role: Role) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!existing) {
    throw new Error("USER_NOT_FOUND");
  }

  if (existing.role) {
    throw new RoleAlreadySetError();
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { role },
    });

    if (role === Role.STUDENT) {
      await tx.student.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });
    } else {
      await tx.company.upsert({
        where: { userId },
        create: {
          userId,
          name: "My Company",
        },
        update: {},
      });
    }

    return user;
  });
}
