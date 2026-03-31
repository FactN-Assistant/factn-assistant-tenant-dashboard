/**
 * lib/api.ts
 * ──────────
 * Typed API client for the LiveChat backend.
 *
 * All functions throw an Error with a human-readable message on failure
 * so callers (form submit handlers, server actions) can catch and display
 * the message directly in the UI.
 *
 * Cookie handling
 * ───────────────
 * The backend sets httpOnly cookies (access_token, refresh_token) on
 * successful login/register.  We set credentials: "include" so the
 * browser sends and receives those cookies automatically.
 * The access_token is ALSO returned in the response body — we store it
 * in the NextAuth session so server-side code can forward it as a
 * Bearer header on protected API calls.
 */

import { AuthResponse } from "@/types/auth"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

/** Generic fetch wrapper — throws on HTTP errors with the backend's detail message */
async function apiFetch<T>(
  path:    string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",           // send & receive httpOnly cookies
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`
    try {
      const err = await res.json()
      if (err?.detail) message = err.detail
    } catch {
      // ignore JSON parse failure — use the generic message
    }
    throw new Error(message)
  }

  // 204 No Content → return empty object
  if (res.status === 204) return {} as T

  return res.json() as Promise<T>
}

// ── Auth endpoints ─────────────────────────────────────────────

export async function apiLogin(
  email:    string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/v1/auth/login", {
    method: "POST",
    body:   JSON.stringify({ email, password }),
  })
}

export async function apiRegister(
  name:     string,
  email:    string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/v1/auth/register", {
    method: "POST",
    body:   JSON.stringify({ name, email, password }),
  })
}

export async function apiLogout(): Promise<void> {
  await apiFetch<void>("/v1/auth/logout", { method: "POST" })
}

export async function apiRefreshToken(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/v1/auth/refresh", { method: "POST" })
}