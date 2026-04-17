"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/useAuthStore";

/**
 * Logout button.
 *
 * What happens on click:
 *   1. POST /api/auth/logout  (Next.js proxy)
 *      → POST /v1/auth/logout  (FastAPI, authenticated by access_token cookie)
 *         FastAPI:
 *           a. Reads access_token cookie → decodes JWT → gets tenant_id
 *           b. DELETE all rows in auth_tokens WHERE tenant_id = ?
 *              (all refresh tokens for this user are gone)
 *           c. Set-Cookie: access_token=; Max-Age=0   ← expires immediately
 *              Set-Cookie: refresh_token=; Max-Age=0  ← expires immediately
 *      Proxy forwards the expiring Set-Cookie headers to the browser.
 *      Browser deletes both cookies from its jar.
 *   2. Zustand store is cleared (user = null)
 *   3. router.push("/login") — middleware will also enforce this on
 *      any subsequent protected route visit.
 *
 * Note: The access_token JWT stays technically valid for up to 15 min
 * after logout (stateless — we can't blacklist a JWT without a DB hit
 * on every request). But the refresh_token is gone, so no new tokens
 * can be issued. If you need immediate full invalidation, rotate
 * JWT_SECRET in your environment (affects all tenants).
 */
export default function Logout() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter()
  const { clear } = useAuthStore()

  async function handleClick() {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // Force clear local state even if API fails
      clear();
      router.push("/auth/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Button
      className="border py-5 px-4 text-neutral-200 rounded-full bg-green-600 hover:bg-green-500 transition-all duration-200 ease-in-out disabled:opacity-60"
      onClick={handleClick}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? "Signing out…" : "Logout"}
    </Button>
  );
}