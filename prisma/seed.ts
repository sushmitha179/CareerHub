import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

    // ✅ STEP 1: create user
    const user = await prisma.user.create({
        data: {
            email: "demo@company.com",
            name: "Demo Company Owner",
        },
    });

    // ✅ STEP 2: create company linked to user
    const company = await prisma.company.create({
        data: {
            userId: user.id, // ✅ valid now
            companyName: "Demo Company",
        },
    });

    // ✅ STEP 3: create listings
    await prisma.listing.createMany({
        data: [
            {
                title: "Frontend Intern",
                companyId: company.id,
                type: "INTERNSHIP",
                description: "Work on React UI",
                skills: "React, JavaScript",
                location: "Remote",
                deadline: new Date("2026-06-01"),
            },
            {
                title: "Backend Intern",
                companyId: company.id,
                type: "INTERNSHIP",
                description: "Node.js APIs",
                skills: "Node, Express, MongoDB",
                location: "Bangalore",
                deadline: new Date("2026-06-10"),
            },
            {
                title: "Hackathon: AI Buildathon",
                companyId: company.id,
                type: "HACKATHON",
                description: "Build AI projects",
                skills: "Python, ML",
                location: "Online",
                deadline: new Date("2026-05-25"),
            },
        ],
    });

    console.log("✅ Seed data added successfully");
}

main();