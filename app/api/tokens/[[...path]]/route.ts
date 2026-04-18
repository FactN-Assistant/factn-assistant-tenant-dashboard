/**
 * app/api/tokens/[[...path]]/route.ts
 * ────────────────────────────────────
 * Proxy for /api/tokens* — forwards to FastAPI /v1/tokens*
 * Forwards the Authorization header (Bearer sk_live_...) used for
 * ephemeral-token mint and rotate operations.
 */

import { BACKEND } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

async function proxy(req: NextRequest, segments: string[]) {
  const subPath = segments.length > 0 ? `/${segments.join("/")}` : "";
  const upstream = `${BACKEND}/tokens${subPath}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const auth = req.headers.get("authorization");
  if (auth) {
    headers["Authorization"] = auth;
  }

  const init: RequestInit = {
    method: req.method,
    headers,
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  return proxy(req, path);
}
