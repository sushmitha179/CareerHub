import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@company.com" },
    update: { role: Role.COMPANY },
    create: {
      email: "demo@company.com",
      name: "Demo Company Owner",
      role: Role.COMPANY,
    },
  });

  const company = await prisma.company.upsert({
    where: { userId: user.id },
    update: { name: "Demo Company" },
    create: {
      userId: user.id,
      name: "Demo Company",
    },
  });

  await prisma.listing.deleteMany({ where: { companyId: company.id } });

  await prisma.listing.createMany({
    data: [
      {
        title: "Frontend Intern",
        companyId: company.id,
        type: "INTERNSHIP",
        description: "Work on React UI",
        skills: ["React", "JavaScript"],
        location: "Remote",
        deadline: new Date("2026-06-01"),
      },
      {
        title: "Backend Intern",
        companyId: company.id,
        type: "INTERNSHIP",
        description: "Node.js APIs",
        skills: ["Node", "Express", "MongoDB"],
        location: "Bangalore",
        deadline: new Date("2026-06-10"),
      },
      {
        title: "Hackathon: AI Buildathon",
        companyId: company.id,
        type: "HACKATHON",
        description: "Build AI projects",
        skills: ["Python", "ML"],
        location: "Online",
        deadline: new Date("2026-05-25"),
      },
    ],
  });

  console.log("✅ Seed data added successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
