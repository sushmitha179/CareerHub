import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token?.role) {
      return NextResponse.redirect(new URL("/select-role", req.url));
    }

    if (token.role === "STUDENT" && path.startsWith("/company")) {
      return NextResponse.redirect(
        new URL("/student/dashboard", req.url)
      );
    }

    if (token.role === "COMPANY" && path.startsWith("/student")) {
      return NextResponse.redirect(
        new URL("/company/dashboard", req.url)
      );
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: ["/student/:path*", "/company/:path*"],
};
