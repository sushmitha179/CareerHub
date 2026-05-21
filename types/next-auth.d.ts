import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: "STUDENT" | "COMPANY";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "STUDENT" | "COMPANY";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "STUDENT" | "COMPANY";
  }
}