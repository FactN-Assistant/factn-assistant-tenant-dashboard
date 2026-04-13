// ─────────────────────────────────────────────────────────────
// app/api/auth/refresh/route.ts
// ─────────────────────────────
// Token refresh: the browser's refresh_token httpOnly cookie is
// forwarded to FastAPI which:
//   1. Validates the hash against MongoDB auth_tokens collection
//   2. Deletes the old token (rotation — single use)
//   3. Issues a new access_token + refresh_token pair
//   4. Sets new cookies
//
// If the access_token has expired but the refresh_token is still
// valid, this endpoint grants a fresh session transparently.
// If both are expired, FastAPI returns 401 and we redirect to login.
// ─────────────────────────────────────────────────────────────

import { BACKEND } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

// File: app/api/auth/refresh/route.ts
// import { NextRequest, NextResponse } from "next/server";
// const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") ?? "";

  const backendRes = await fetch(`${BACKEND}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,   // forward both cookies — FastAPI reads refresh_token cookie
    },
  });

  if (!backendRes.ok) {
    const data = await backendRes.json().catch(() => ({ detail: "Session expired" }));
    return NextResponse.json(data, { status: backendRes.status });
  }

  const data = await backendRes.json();
  const res = NextResponse.json(data, { status: 200 });

  const setCookies = backendRes.headers.getSetCookie?.() ??
    [backendRes.headers.get("set-cookie") ?? ""].filter(Boolean);
  for (const cookie of setCookies) {
    res.headers.append("Set-Cookie", cookie);
  }

  return res;
}

