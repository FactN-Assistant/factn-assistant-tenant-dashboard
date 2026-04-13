/**
 * middleware.ts  (place at project root, next to app/)
 * ──────────────────────────────────────────────────────
 * Next.js edge middleware — runs on every request BEFORE
 * the page/route handler.
 *
 * Responsibilities:
 * 1. Protect /dashboard/* routes — redirect to /login if no cookie
 * 2. Redirect logged-in users away from /login and /register
 * 3. (Optional) Auto-refresh access_token if near expiry
 *
 * WHY middleware instead of client-side guards?
 * ─────────────────────────────────────────────
 * Client-side guards flash the protected page for a frame before
 * redirecting. Middleware runs at the edge before any HTML is sent,
 * so unauthenticated users never see protected content.
 *
 * IMPORTANT: Middleware cannot call argon2 or complex DB logic.
 * We only CHECK that the cookie exists. FastAPI enforces the actual
 * validity of the JWT on every protected API call.
 */

import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/projects", "/settings"];

// Routes that should redirect to /dashboard if already authenticated
const AUTH_ROUTES = ["/login", "/register"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for access_token cookie — set by FastAPI on login/register
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  const hasSession = !!accessToken || !!refreshToken;
  // We check both: access_token may have expired (15 min) but
  // refresh_token (7 days) still allows transparent renewal.

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  // Unauthenticated user trying to access a protected route
  if (isProtected && !hasSession) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("next", pathname); // redirect back after login
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access /login or /register
  if (isAuthRoute && hasSession) {
    const dashUrl = req.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static files, images, api routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};