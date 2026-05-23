import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import { dashboardPath } from "@/lib/routes";

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
    async signIn({ user }) {
      // Never auto-assign a role; OAuth users stay role=null until /select-role
      if (!user.email) return false;
      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
      }

      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true, role: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role ?? undefined;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "STUDENT" | "COMPANY" | undefined;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },

  events: {
    async createUser({ user }) {
      // Ensure new OAuth users have no default role (schema has no default)
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: null },
        });
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
