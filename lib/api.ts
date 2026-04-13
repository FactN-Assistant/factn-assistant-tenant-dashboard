/**
 * lib/api.ts
 * ----------
 * Base fetch wrapper for all API calls.
 *
 * WHY credentials: "include"
 * The FastAPI backend sets two httpOnly cookies on login:
 *   access_token  – 15-min JWT
 *   refresh_token – 7-day opaque string
 *
 * httpOnly means JavaScript CANNOT read them. But the browser
 * automatically attaches them on every fetch to the same origin
 * as long as credentials: "include" is set. Without this flag
 * the cookies are silently ignored and every request looks like
 * an anonymous request.
 *
 * For server-side calls (Next.js Server Components / Route Handlers)
 * we forward the cookie string manually from the incoming request
 * headers, because the server-side fetch doesn't have a browser
 * cookie jar automatically.
 */

import { BACKEND } from "./constants";

//const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

/**
 * Client-side fetch — cookies are sent automatically by the browser.
 * Always goes through the Next.js API proxy route to avoid CORS.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",        // ← critical: send httpOnly cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? "Unknown error");
  }

  // 204 No Content (logout) has no body
  if (res.status === 204) return undefined as T;
  return res.json();
}

/**
 * Server-side fetch — used in Server Components and Route Handlers.
 * Manually forwards the cookie header from the incoming request
 * so the FastAPI backend receives the access_token cookie.
 *
 * Also adds Authorization: Bearer for FastAPI's get_current_tenant()
 * dependency which checks the header FIRST before the cookie.
 */
export async function serverFetch<T>(
  path: string,
  cookieHeader: string,          // from request.headers.get("cookie")
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BACKEND}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,       // forward browser cookies to FastAPI
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? "Unknown error");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}