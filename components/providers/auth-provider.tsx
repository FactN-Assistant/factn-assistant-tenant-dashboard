/**
 * components/AuthProvider.tsx
 * ----------------------------
 * Wraps the app, triggers session hydration on mount.
 * Place this inside your root layout.tsx.
 *
 * Usage:
 *   // app/layout.tsx
 *   import { AuthProvider } from "@/components/AuthProvider";
 *   export default function RootLayout({ children }) {
 *     return <html><body><AuthProvider>{children}</AuthProvider></body></html>;
 *   }
 */

"use client";

import { useAuth } from "@/hooks/useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // useAuth() has a useEffect that runs /api/auth/me on mount
  // to hydrate the auth store from the httpOnly cookie.
  useAuth();
  return <>{children}</>;
}