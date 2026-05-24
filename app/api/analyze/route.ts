import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { requireStudentSession } from "@/lib/student-auth";
import {
  extractTextFromResume,
} from "@/lib/resume-storage";
import { analyzeResumeText } from "@/lib/resume-analysis";
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const MAX_RESUME_LENGTH = 50_000;

export async function POST(req: Request) {
  try {
    const auth = await requireStudentSession();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    let resumeText: string = body.text?.trim() ?? "";
    let source: "paste" | "upload" = "paste";

    if (body.useUploadedResume) {
      const student = await prisma.student.findUnique({
        where: { userId: auth.userId },
      });

      if (!student?.resumeUrl) {
        return NextResponse.json(
          { error: "Upload a resume on your profile first" },
          { status: 400 }
        );
      }
      const extracted = await extractTextFromResume(
        student.resumeUrl,
        student.resumeMimeType
      );
      

      if (!extracted.text) {
        return NextResponse.json(
          {
            error:
              extracted.warning ||
              "Could not extract text from uploaded file",
          },
          { status: 400 }
        );
      }

      resumeText = extracted.text;
      source = "upload";
    }

    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 }
      );
    }

    if (resumeText.length > MAX_RESUME_LENGTH) {
      return NextResponse.json(
        { error: "Resume text is too long" },
        { status: 400 }
      );
    }

    const analysis = analyzeResumeText(resumeText);

    let aiSummary: string | null = null;

    if (openai) {
      try {
        const aiResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an ATS resume coach. Be concise and actionable.",
            },
            {
              role: "user",
              content: `Resume:\n${resumeText.slice(0, 12000)}\n\nGive 3-5 bullet improvements for ATS and internships.`,
            },
          ],
          max_tokens: 500,
        });
        aiSummary = aiResponse.choices[0].message.content;
      } catch (e) {
        console.error("OpenAI analyze error:", e);
      }
    }

    return NextResponse.json({
      source,
      ...analysis,
      aiSummary,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
