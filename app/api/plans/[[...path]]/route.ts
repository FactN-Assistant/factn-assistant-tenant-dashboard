/**
 * app/api/plans/[[...path]]/route.ts
 * ────────────────────────────────────
 * Catch-all proxy for /api/plans* — forwards every request to FastAPI
 * with the user's httpOnly cookies attached so auth works transparently.
 */

import { BACKEND } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

async function proxy(req: NextRequest, segments: string[]) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const subPath = segments.length > 0 ? `/${segments.join("/")}` : "";
  const search = req.nextUrl.search ?? "";

  const upstream = `${BACKEND}/plans${subPath}${search}`;

  const init: RequestInit = {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  };

  if (!["GET", "HEAD"].includes(req.method)) {
    init.body = await req.text();
  }

  const backendRes = await fetch(upstream, init);

  if (backendRes.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: backendRes.status });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  return proxy(req, path);
}
