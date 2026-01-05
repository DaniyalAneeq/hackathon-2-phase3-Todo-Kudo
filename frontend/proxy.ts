import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // Cookie-based check for optimistic redirect
  // NOTE: This is NOT secure on its own!
  // Actual security is enforced in server components via auth.api.getSession()
  // This proxy only provides a better UX by redirecting early
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // Protect all dashboard routes
};
