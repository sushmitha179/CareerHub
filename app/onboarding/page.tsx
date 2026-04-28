"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function selectRole(role: "STUDENT" | "COMPANY") {
    setLoading(true)
    await fetch("/api/onboarding", {
      method: "POST",
      body: JSON.stringify({ role }),
      headers: { "Content-Type": "application/json" },
    })
    router.push(role === "STUDENT" ? "/student/dashboard" : "/company/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 p-8 border rounded-xl">
        <h1 className="text-2xl font-semibold">I am a...</h1>
        <div className="flex gap-4">
          <Button disabled={loading} onClick={() => selectRole("STUDENT")}>Student</Button>
          <Button disabled={loading} variant="outline" onClick={() => selectRole("COMPANY")}>Company</Button>
        </div>
      </div>
    </div>
  )
}