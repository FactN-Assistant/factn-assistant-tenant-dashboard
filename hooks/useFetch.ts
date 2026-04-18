"use client";

import { useAuth } from "./useAuth";

function extractDetail(detail: unknown): string | undefined {
  if (!detail) return undefined;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => d.msg ?? JSON.stringify(d)).join("; ");
  }
  return JSON.stringify(detail);
}

export function useFetch() {
  const { refresh } = useAuth();

  async function fetchWithRefresh<T>(
    input: string,
    init: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`/api${input}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init.headers },
    });

    if (res.status === 401) {
      const refreshed = await refresh();
      if (!refreshed) throw new Error("Session expired");

      const retryRes = await fetch(`/api${input}`, {
        ...init,
        credentials: "include",
        headers: { "Content-Type": "application/json", ...init.headers },
      });

      if (!retryRes.ok) {
        const body = await retryRes.json().catch(() => ({}));
        throw new Error(extractDetail(body.detail) ?? retryRes.statusText);
      }
      if (retryRes.status === 204) return undefined as T;
      return retryRes.json();
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(extractDetail(body.detail) ?? res.statusText);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  return fetchWithRefresh;
}