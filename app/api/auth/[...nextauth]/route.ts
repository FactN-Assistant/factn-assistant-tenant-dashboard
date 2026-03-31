/**
 * app/api/auth/[...nextauth]/route.ts
 * ────────────────────────────────────
 * NextAuth catch-all route handler.
 * Handles all /api/auth/* requests: session checks, signIn, signOut, callbacks.
 */

import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers