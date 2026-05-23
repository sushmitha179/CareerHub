"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Welcome to CareerHub</h1>
        <p className="text-muted-foreground">
          Internships & Hackathons for students
        </p>
        <Button onClick={() => signIn("google", { callbackUrl: "/" })}>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
