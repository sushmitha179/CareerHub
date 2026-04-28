import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role } = await req.json()

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role },
  })

  if (role === "STUDENT") {
    await prisma.student.create({ data: { userId: session.user.id } })
  } else {
    await prisma.company.create({
      data: { userId: session.user.id, companyName: session.user.name || "My Company" },
    })
  }

  return NextResponse.json({ success: true })
}