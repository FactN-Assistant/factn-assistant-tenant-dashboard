/**
 * app/api/auth/logout/route.ts
 * ────────────────────────────
 * Calls POST /v1/auth/logout on FastAPI. The backend:
 *   1. Reads the access_token cookie (via get_current_tenant dependency)
 *   2. Deletes all refresh tokens for that tenant from MongoDB
 *   3. Sends Set-Cookie headers that expire both cookies immediately
 *
 * We forward the cookie from the browser so FastAPI can authenticate
 * the logout request, and we forward the expiring Set-Cookie headers
 * back so the browser clears the cookies from its jar.
 */

import { ACCESS_TOKEN, BACKEND } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get(ACCESS_TOKEN) ?? "";

  const backendRes = await fetch(`${BACKEND}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,   // forward the access_token cookie so FastAPI can auth the request
    },
  });

  if (!backendRes.ok && backendRes.status !== 204) {
    const data = await backendRes.json().catch(() => ({ detail: "Logout failed" }));
    return NextResponse.json(data, { status: backendRes.status });
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });

  // FastAPI sends Set-Cookie headers that expire the cookies — forward them
  const setCookies = backendRes.headers.getSetCookie?.() ??
    [backendRes.headers.get("set-cookie") ?? ""].filter(Boolean);
  for (const cookie of setCookies) {
    res.headers.append("Set-Cookie", cookie);
  }

  return res;
}