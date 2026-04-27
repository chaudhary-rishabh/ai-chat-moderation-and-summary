import { NextResponse } from "next/server";
import { auth } from "./auth";

const protectedPaths = ["/chat", "/ai", "/stories", "/settings"];
const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const session = req.auth;
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isAuthPath = authPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }
  if ((session as any)?.error === "RefreshTokenExpired" && isProtected) {
    return NextResponse.redirect(new URL("/login?error=session_expired", req.nextUrl.origin));
  }
  if (session && isAuthPath) {
    return NextResponse.redirect(new URL("/chat", req.nextUrl.origin));
  }
  return NextResponse.next();
});

export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
