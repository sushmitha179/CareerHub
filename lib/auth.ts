import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/",
  },

  callbacks: {
    async jwt({ token, user }) {

      if (user?.email) {

        const dbUser = await prisma.user.findUnique({
          where: {
            email: user.email,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }

      // Refresh latest role
      if (token?.email) {

        const latestUser = await prisma.user.findUnique({
          where: {
            email: token.email,
          },
        });

        if (latestUser) {
          token.id = latestUser.id;
          token.role = latestUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {

      if (session.user) {

        session.user.id = token.id as string;

        session.user.role =
          token.role as "STUDENT" | "COMPANY";
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};