import { NextResponse } from "next/server";
import { auth } from "./auth";

const protectedPaths = ["/dashboard", "/users", "/rooms", "/safety", "/analytics"];

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (pathname === "/login" && req.auth) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
  if (isProtected && (!req.auth || (req.auth as any).error === "INSUFFICIENT_ROLE")) {
    return NextResponse.redirect(new URL("/login?error=unauthorized", req.nextUrl.origin));
  }
  return NextResponse.next();
});

export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
