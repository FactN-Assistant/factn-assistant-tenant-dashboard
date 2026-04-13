/**
 * hooks/useAuth.ts
 * -----------------
 * Single hook that wraps all auth operations.
 *
 * On first mount it calls /api/auth/me — if the browser's httpOnly
 * access_token cookie is still valid (within 15 min), FastAPI decodes
 * the JWT and returns the tenant profile. No password needed.
 * If that returns 401 it tries /api/auth/refresh — if the 7-day
 * refresh_token cookie is still valid it gets a new access_token.
 * If both fail, the user is logged out.
 *
 * This gives us transparent session persistence across hard refreshes.
 */

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/useAuthStore";
import type { LoginPayload, RegisterPayload, AuthUser } from "@/lib/auth";

export function useAuth() {
  const { user, isLoading, setUser, setLoading, clear } = useAuthStore();
  const router = useRouter();

  // ── Re-hydrate on mount ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        // 1. Try /api/auth/me — works if access_token cookie is still valid
        const meRes = await fetch("/api/auth/me", { credentials: "include" });

        if (meRes.ok && !cancelled) {
          const profile = await meRes.json();
          // Note: no access_token in /me response — we store without it
          // The cookie is the credential; token in store is optional bonus
          setUser({ ...profile, access_token: "" });
          return;
        }

        // 2. access_token expired — try refresh_token cookie
        if (meRes.status === 401) {
          const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          });

          if (refreshRes.ok && !cancelled) {
            const data = await refreshRes.json();
            setUser({
              tenant_id: data.tenant_id,
              email: data.email,
              name: data.name,
              plan: data.plan,
              access_token: data.access_token,
            });
            return;
          }
        }

        // Both failed — no valid session
        if (!cancelled) clear();
      } catch {
        if (!cancelled) clear();
      }
    }

    hydrate();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ───────────────────────────────────────────────────
  const login = useCallback(async (payload: LoginPayload) => {
    /**
     * POST /api/auth/login (Next.js proxy)
     *   → POST /v1/auth/login (FastAPI)
     *   ← { access_token, tenant_id, email, name, plan }
     *   ← Set-Cookie: access_token=<jwt>; HttpOnly  (15 min)
     *   ← Set-Cookie: refresh_token=<opaque>; HttpOnly  (7 days)
     *
     * The cookies are set automatically by the browser.
     * We also store the access_token in memory for convenience.
     */
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",   // ensure browser sends+receives cookies
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      // Return the error so the form can display it
      throw new Error(data.detail ?? "Login failed");
    }

    const authUser: AuthUser = {
      tenant_id: data.tenant_id,
      email: data.email,
      name: data.name,
      plan: data.plan,
      access_token: data.access_token,   // in memory only
    };

    setUser(authUser);
    router.push("/dashboard");
  }, [setLoading, setUser, router]);

  // ── Register ────────────────────────────────────────────────
  const register = useCallback(async (payload: RegisterPayload) => {
    /**
     * POST /api/auth/register (Next.js proxy)
     *   → POST /v1/auth/register (FastAPI)
     *
     * FastAPI process:
     *   1. hash_password(password)  ← argon2, time_cost=3, memory=64MB
     *   2. INSERT tenant into MongoDB
     *   3. UPDATE password_hash
     *   4. create_access_token() → 15-min JWT signed with JWT_SECRET
     *   5. AuthTokenRepository.create() → random 32-byte token, argon2 hash
     *      stored in auth_tokens collection with 7-day TTL
     *   6. Set httpOnly cookies, return body with access_token
     *
     * Same response shape as login → same handling.
     */
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      throw new Error(data.detail ?? "Registration failed");
    }

    const authUser: AuthUser = {
      tenant_id: data.tenant_id,
      email: data.email,
      name: data.name,
      plan: data.plan,
      access_token: data.access_token,
    };

    setUser(authUser);
    router.push("/dashboard");
  }, [setLoading, setUser, router]);

  // ── Logout ──────────────────────────────────────────────────
  const logout = useCallback(async () => {
    /**
     * POST /api/auth/logout
     *   → POST /v1/auth/logout (FastAPI, authenticated by cookie)
     *
     * FastAPI:
     *   1. Reads access_token cookie → get_current_tenant()
     *   2. DELETE all auth_tokens WHERE tenant_id = ? (MongoDB)
     *   3. Set-Cookie: access_token=; Max-Age=0  (expire immediately)
     *   4. Set-Cookie: refresh_token=; Max-Age=0
     *
     * The access_token JWT remains technically valid for up to 15 min
     * more (stateless — we can't revoke it), but the refresh_token is
     * gone so no new tokens can be issued. Full invalidation = rotate JWT_SECRET.
     */
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    clear();
    router.push("/login");
  }, [clear, router]);

  // ── Refresh ─────────────────────────────────────────────────
  const refresh = useCallback(async (): Promise<boolean> => {
    /**
     * Called automatically when a 401 is received on any API call.
     * 
     * POST /v1/auth/refresh (FastAPI):
     *   1. Reads refresh_token httpOnly cookie
     *   2. Hashes it, finds match in auth_tokens collection
     *   3. DELETE old token doc (rotation — single use)
     *   4. CREATE new token doc with same tenant_id, same family
     *   5. Return new access_token, set new cookies
     *
     * Token rotation means: if someone steals your refresh token and
     * uses it after you've already rotated it, FastAPI sees a "superseded
     * token" and logs a security warning. (The old token is gone, so
     * their use would return 401.)
     */
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        clear();
        router.push("/login");
        return false;
      }

      const data = await res.json();
      setUser({
        tenant_id: data.tenant_id,
        email: data.email,
        name: data.name,
        plan: data.plan,
        access_token: data.access_token,
      });
      return true;
    } catch {
      clear();
      return false;
    }
  }, [clear, setUser, router]);

  return { user, isLoading, login, register, logout, refresh };
}