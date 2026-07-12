import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtected =
    pathname.startsWith("/today") ||
    pathname.startsWith("/schedule") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/leaderboard") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/friends") ||
    pathname.startsWith("/reminders") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/region");
  // note: /region/scoring is under /region

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/today", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/today/:path*",
    "/schedule/:path*",
    "/history/:path*",
    "/leaderboard/:path*",
    "/account/:path*",
    "/friends/:path*",
    "/reminders/:path*",
    "/admin/:path*",
    "/region/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
