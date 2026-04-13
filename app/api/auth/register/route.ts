/**
 * app/api/auth/register/route.ts
 * ──────────────────────────────
 * Same pattern as /api/auth/login — proxies to POST /v1/auth/register.
 * On success the backend creates the tenant, hashes the password,
 * issues tokens, and sets the same two httpOnly cookies.
 * We forward the Set-Cookie headers so the browser gets them.
 */

import { BACKEND } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

// const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const backendRes = await fetch(`${BACKEND}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const res = NextResponse.json(data, { status: 201 });

  const setCookies = backendRes.headers.getSetCookie?.() ??
    [backendRes.headers.get("set-cookie") ?? ""].filter(Boolean);
  for (const cookie of setCookies) {
    res.headers.append("Set-Cookie", cookie);
  }

  return res;
}