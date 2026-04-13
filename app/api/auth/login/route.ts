/**
 * app/api/auth/login/route.ts
 * ---------------------------
 * Next.js Route Handler — proxies POST /v1/auth/login to FastAPI.
 *
 * WHY a proxy instead of calling FastAPI directly from the browser?
 * ─────────────────────────────────────────────────────────────────
 * 1. CORS: FastAPI (localhost:8000) and Next.js (localhost:3000) are
 *    different origins. Browsers block cross-origin requests that set
 *    cookies. The proxy solves this — the browser only ever talks to
 *    localhost:3000, and the cookies are set on that domain.
 *
 * 2. httpOnly cookie forwarding: FastAPI sets cookies in its response
 *    headers. This Route Handler copies those Set-Cookie headers to the
 *    outgoing Next.js response so the browser stores them under the
 *    Next.js domain (not the FastAPI domain). Without this, the cookies
 *    would be set for localhost:8000 and would never be sent to Next.js.
 *
 * 3. Security: The backend URL (localhost:8000 or prod URL) is never
 *    exposed to the browser. Only Next.js knows it.
 *
 * The flow:
 *   Browser → POST /api/auth/login (Next.js)
 *             → POST /v1/auth/login (FastAPI)  [server-to-server]
 *             ← {access_token, ...} + Set-Cookie headers
 *           ← forward body + Set-Cookie to browser
 *   Browser stores httpOnly cookies automatically.
 */

import { BACKEND } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Forward to FastAPI — server-to-server, no CORS restriction
  const backendRes = await fetch(`${BACKEND}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  // Build the Next.js response with the same JSON body
  const res = NextResponse.json(data, { status: 200 });

  /**
   * CRITICAL: Copy Set-Cookie headers from FastAPI to the browser.
   *
   * FastAPI sets:
   *   Set-Cookie: access_token=<jwt>; HttpOnly; SameSite=Lax; Path=/; Max-Age=900
   *   Set-Cookie: refresh_token=<opaque>; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800
   *
   * We must forward these so the browser stores them under the
   * Next.js domain (not the FastAPI domain). The cookies will then
   * be automatically sent on all subsequent browser → Next.js requests.
   */
  const setCookies = backendRes.headers.getSetCookie?.() ??
    [backendRes.headers.get("set-cookie") ?? ""].filter(Boolean);

  for (const cookie of setCookies) {
    res.headers.append("Set-Cookie", cookie);
  }

  return res;
}