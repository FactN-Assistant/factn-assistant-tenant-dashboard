
// ─────────────────────────────────────────────────────────────
// app/api/auth/me/route.ts
// ────────────────────────
// Used on page load to re-hydrate auth state from the httpOnly cookie.
// FastAPI reads the access_token cookie, decodes the JWT, and returns
// the tenant profile without a database lookup (stateless JWT).
// ─────────────────────────────────────────────────────────────

import { BACKEND } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

// File: app/api/auth/me/route.ts
export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") ?? "";

  const backendRes = await fetch(`${BACKEND}/auth/me`, {
    headers: { Cookie: cookieHeader },
  });

  if (!backendRes.ok) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json(await backendRes.json());
}