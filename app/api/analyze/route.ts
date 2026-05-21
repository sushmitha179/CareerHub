import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const resumeText: string = body.text;

        // 🔹 BASIC SKILL CHECK (your logic)
        const requiredSkills = [
            "javascript",
            "react",
            "node",
            "mongodb",
            "sql",
            "python",
            "java",
            "data structures",
            "algorithms"
        ];

        const lowerText = resumeText.toLowerCase();

        const foundSkills = requiredSkills.filter(skill =>
            lowerText.includes(skill)
        );

        const missingSkills = requiredSkills.filter(
            skill => !foundSkills.includes(skill)
        );

        // 🔹 AI ANALYSIS
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a career mentor helping students improve resumes.",
                },
                {
                    role: "user",
                    content: `
Analyze this resume:

${resumeText}

Give:
1. Skill gaps
2. Improvements
3. Suitable job roles
4. Short actionable advice
          `,
                },
            ],
        });

        return NextResponse.json({
            foundSkills,
            missingSkills,
            aiFeedback: aiResponse.choices[0].message.content,
        });

    } catch (error) {
        console.error(error);

        // 🔥 fallback if AI fails
        return NextResponse.json({
            fallback: true,
            message: "AI failed, using basic analysis",
        });
    }
}