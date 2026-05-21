import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {

        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Not logged in
        if (!token) {
            return NextResponse.redirect(
                new URL("/", req.url)
            );
        }

        // STUDENT accessing company routes
        if (
            token.role === "STUDENT" &&
            path.startsWith("/company")
        ) {
            return NextResponse.redirect(
                new URL("/student/dashboard", req.url)
            );
        }

        // COMPANY accessing student routes
        if (
            token.role === "COMPANY" &&
            path.startsWith("/student")
        ) {
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
    matcher: [
        "/student/:path*",
        "/company/:path*",
    ],
};