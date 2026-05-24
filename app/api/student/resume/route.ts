import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateResumeFile } from "@/lib/resume-storage";
import { requireStudentSession } from "@/lib/student-auth";

export async function GET() {
  const auth = await requireStudentSession();

  if ("error" in auth) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  const student = await prisma.student.findUnique({
    where: { userId: auth.userId },
  });

  if (!student?.resumeUrl) {
    return NextResponse.json(
      { error: "No resume uploaded" },
      { status: 404 }
    );
  }

  return NextResponse.redirect(student.resumeUrl);
}

export async function POST(req: Request) {
  const auth = await requireStudentSession();

  if ("error" in auth) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const formData = await req.formData();

    const file = formData.get("file");

    const uploadedUrl = formData.get("uploadedUrl");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!uploadedUrl || typeof uploadedUrl !== "string") {
      return NextResponse.json(
        { error: "Upload URL missing" },
        { status: 400 }
      );
    }

    const validation = validateResumeFile(file);

    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const student = await prisma.student.upsert({
      where: { userId: auth.userId },

      update: {
        resumeUrl: uploadedUrl,
        resumeFileName: file.name,
        resumeMimeType: validation.mimeType,
        resumeUploadedAt: new Date(),
      },

      create: {
        userId: auth.userId,
        resumeUrl: uploadedUrl,
        resumeFileName: file.name,
        resumeMimeType: validation.mimeType,
        resumeUploadedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      resumeUrl: student.resumeUrl,
      resumeFileName: student.resumeFileName,
      resumeUploadedAt: student.resumeUploadedAt,
      message: "Resume uploaded successfully",
    });

  } catch (error) {
    console.error("Resume upload error:", error);

    return NextResponse.json(
      { error: "Failed to upload resume" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const auth = await requireStudentSession();

  if ("error" in auth) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  await prisma.student.update({
    where: { userId: auth.userId },

    data: {
      resumeUrl: null,
      resumeFileName: null,
      resumeMimeType: null,
      resumeUploadedAt: null,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Resume removed",
  });
}