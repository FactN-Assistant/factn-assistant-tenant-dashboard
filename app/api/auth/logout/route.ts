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
const cookieHeader = req.headers.get("cookie") ?? "";

  const backendRes = await fetch(`${BACKEND}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  });

  // Even if backend fails, clear cookies on the Next.js side
  const res = NextResponse.json({ ok: true }, { status: 200 });

  // Forward the Set-Cookie headers from FastAPI (Max-Age=0 expiry headers)
  const setCookies =
    backendRes.headers.getSetCookie?.() ??
    [backendRes.headers.get("set-cookie") ?? ""].filter(Boolean);

  for (const cookie of setCookies) {
    res.headers.append("Set-Cookie", cookie);
  }

  // Fallback: force-clear cookies on the Next.js proxy side too
  // in case the backend didn't send proper expiry headers
  if (setCookies.length === 0) {
    res.headers.append(
      "Set-Cookie",
      "access_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
    );
    res.headers.append(
      "Set-Cookie",
      "refresh_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
    );
  }

  return res;
}