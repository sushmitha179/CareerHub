import { NextResponse } from "next/server";
// import { readFile } from "fs/promises";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
// import { resolveResumeAbsolutePath } from "@/lib/resume-storage";

/** Company downloads applicant resume (authorized via application ownership) */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const applicationId = new URL(req.url).searchParams.get("applicationId");

  if (!applicationId) {
    return NextResponse.json(
      { error: "applicationId is required" },
      { status: 400 }
    );
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      listing: true,
      student: true,
    },
  });

  if (!application || application.listing.companyId !== company.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const student = application.student;

  if (!student.resumeUrl) {
    return NextResponse.json({ error: "No resume uploaded" }, { status: 404 });
  }

  // try {
  //   const absolutePath = resolveResumeAbsolutePath(student.resumeUrl);
  //   const buffer = await readFile(absolutePath);
  //   const fileName = student.resumeFileName || "resume.pdf";

  //   return new NextResponse(buffer, {
  //     headers: {
  //       "Content-Type": student.resumeMimeType || "application/octet-stream",
  //       "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
  //       "Cache-Control": "private, no-cache",
  //     },
  //   });
  // } catch {
  //   return NextResponse.json(
  //     { error: "Resume file not found" },
  //     { status: 404 }
  //   );
  // }
  return NextResponse.redirect(student.resumeUrl);
}
