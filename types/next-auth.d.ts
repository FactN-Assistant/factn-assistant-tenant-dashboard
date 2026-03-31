/**
 * types/next-auth.d.ts
 * ─────────────────────
 * Module augmentation — extends NextAuth's built-in Session and JWT types
 * with our custom fields so TypeScript knows what's in useSession().user.
 *
 * Pattern for NextAuth v5:
 *   - Augment `Session["user"]` by extending the default user shape.
 *   - Augment `JWT` directly with extra fields.
 *   - `session.error` is added to `Session` itself (not the user).
 */

import type { DefaultSession } from "next-auth"
import type { JWT as DefaultJWT } from "next-auth/jwt"

type Plan = "free" | "starter" | "pro" | "enterprise"

declare module "next-auth" {
  interface Session {
    user: {
      /** Our backend's tenant UUID */
      tenant_id:    string
      /** Billing / feature plan tier */
      plan:         Plan
      /** Backend access token — forward as Bearer on API calls */
      access_token: string
    } & DefaultSession["user"]

    /** Set by the jwt callback when the backend refresh call fails */
    error?: "RefreshTokenExpired"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tenant_id:               string
    plan:                    Plan
    access_token:            string
    /** Unix ms timestamp of when the backend access token expires */
    access_token_expires_at: number
    error?:                  "RefreshTokenExpired"
  }
}