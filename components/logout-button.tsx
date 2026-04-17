"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useEffect } from "react";

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
export default function LogoutButton() {
  const { logoutMutation } = useAuth();

  const isLoggingOut = logoutMutation.isPending;
  const logoutError = logoutMutation.error;

  // Show error toast if logout fails
  useEffect(() => {
    if (logoutError) {
      const message = logoutError.message || "Logout failed";
      toast.error(message);
    }
  }, [logoutError]);

  const handleClick = () => {
    logoutMutation.mutate();
  };

  return (
    <Button
      className="border text-neutral-100 bg-rose-600 hover:bg-rose-700 "
      onClick={handleClick}
      size={"lg"}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? "Signing out…" : "Sign out"}
    </Button>
  );
}