/**
 * components/auth/session-provider.tsx
 * ──────────────────────────────────────
 * Client-side wrapper for NextAuth's SessionProvider.
 *
 * SessionProvider must be a Client Component (it uses React context).
 * We wrap it here so the root layout can remain a Server Component.
 *
 * refetchInterval: 4 * 60 — re-check the session every 4 minutes.
 * Combined with the 15-minute access_token and the 60-second refresh
 * buffer in lib/auth.ts, this ensures the token is silently refreshed
 * before it expires.
 */

"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider refetchInterval={4 * 60}>
      {children}
    </NextAuthSessionProvider>
  )
}