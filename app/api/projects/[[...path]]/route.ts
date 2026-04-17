/**
 * app/api/projects/[[...path]]/route.ts
 * ----------------------------------------
 * Catch-all proxy for /api/projects* — forwards every request to FastAPI
 * with the user's httpOnly cookies attached so auth works transparently.
 *
 * Uses optional catch-all [[...path]] so it matches:
 *   GET  /api/projects            → GET  /v1/projects
 *   GET  /api/projects/{id}       → GET  /v1/projects/{id}
 *   POST /api/projects            → POST /v1/projects
 *   PATCH /api/projects/{id}      → PATCH /v1/projects/{id}
 *   DELETE /api/projects/{id}     → DELETE /v1/projects/{id}
 *   … and every sub-resource (tools, sessions, usage, keys, etc.)
 */

import { BACKEND } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

async function proxy(req: NextRequest, segments: string[]) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const subPath = segments.length > 0 ? `/${segments.join("/")}` : "";
  const search = req.nextUrl.search ?? "";

  const upstream = `${BACKEND}/projects${subPath}${search}`;

  const init: RequestInit = {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  };

  // Forward body for mutating methods
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  return proxy(req, path);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  return proxy(req, path);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  return proxy(req, path);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  return proxy(req, path);
}