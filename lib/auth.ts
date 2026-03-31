/**
 * lib/auth.ts
 * ───────────
 * NextAuth v5 configuration using the Credentials provider.
 *
 * Key points
 * ──────────
 * • NextAuthConfig is a TYPE — use `import type`, not a value import.
 * • Callback parameters (jwt, session) must be typed explicitly with
 *   Session and JWT from "next-auth" / "next-auth/jwt".
 * • The config object uses `satisfies NextAuthConfig` rather than
 *   being typed directly on the variable — this is the v5 pattern.
 * • We call NextAuth(config) once and export the helpers from the result.
 *
 * Architecture
 * ────────────
 * Our backend issues its own JWTs and sets httpOnly cookies.
 * NextAuth is used purely for browser-side session management:
 *   authorize()  → calls our backend login/register endpoint
 *   jwt()        → stores the response in NextAuth's encrypted cookie,
 *                  silently refreshes the backend access token before expiry
 *   session()    → shapes what useSession().data.user exposes to the app
 */

import NextAuth                  from "next-auth"
import CredentialsProvider        from "next-auth/providers/credentials"
import type { Session, User }     from "next-auth"
import type { JWT }               from "next-auth/jwt"
import type { NextAuthConfig }    from "next-auth"
import { apiLogin, apiRegister, apiRefreshToken } from "@/lib/api"

// Proactively refresh the backend access_token this many seconds before expiry
const REFRESH_BUFFER_SECONDS = 60

const config = {
  session: {
    strategy: "jwt",
    // Match the backend refresh token lifetime
    maxAge: 7 * 24 * 60 * 60,  // 7 days in seconds
  },

  pages: {
    signIn:  "/auth/login",
    signOut: "/auth/login",
    error:   "/auth/login",
  },

  providers: [
    CredentialsProvider({
      id:   "credentials",
      name: "Email & Password",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
        name:     { label: "Name",     type: "text"     },
        action:   { label: "Action",   type: "text"     }, // "login" | "register"
      },

      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) return null

        const action   = (credentials.action   as string) ?? "login"
        const email    = (credentials.email    as string)
        const password = (credentials.password as string)

        try {
          let data
          if (action === "register") {
            const name = (credentials.name as string) ?? ""
            if (!name.trim()) throw new Error("Full name is required.")
            data = await apiRegister(name.trim(), email, password)
          } else {
            data = await apiLogin(email, password)
          }

          // Return a User-compatible object.
          // Custom fields are picked up by the jwt() callback below.
          return {
            id:                       data.tenant_id,
            name:                     data.name,
            email:                    data.email,
            // Extra fields — read in jwt() via (user as any)
            tenant_id:                data.tenant_id,
            plan:                     data.plan,
            access_token:             data.access_token,
            access_token_expires_at:  Date.now() + 15 * 60 * 1000,
          } as User
        } catch (err: any) {
          // Throwing causes NextAuth to surface the message on the sign-in page
          throw new Error(err?.message ?? "Authentication failed.")
        }
      },
    }),
  ],

  callbacks: {
    /**
     * jwt — called every time NextAuth verifies or creates its session cookie.
     *
     * First call (sign-in):  `user` is populated — copy fields into the token.
     * Subsequent calls:      `user` is undefined — check expiry and refresh.
     */
    async jwt({ token, user }: { token: JWT; user?: User }) {
      // ── Initial sign-in: copy user fields into the token ──
      if (user) {
        const u = user as any
        token.tenant_id             = u.tenant_id
        token.plan                  = u.plan
        token.access_token          = u.access_token
        token.access_token_expires_at = u.access_token_expires_at
        return token
      }

      // ── Token is still fresh — no action needed ────────────
      const expiresAt = (token.access_token_expires_at as number) ?? 0
      if (Date.now() < expiresAt - REFRESH_BUFFER_SECONDS * 1000) {
        return token
      }

      // ── Access token expired — attempt silent refresh ───────
      // apiRefreshToken() calls POST /v1/auth/refresh.
      // The backend reads the httpOnly refresh_token cookie automatically.
      try {
        const refreshed = await apiRefreshToken()
        token.access_token          = refreshed.access_token
        token.name                  = refreshed.name
        token.email                 = refreshed.email
        token.plan                  = refreshed.plan as JWT["plan"]
        token.access_token_expires_at = Date.now() + 15 * 60 * 1000
        // Clear any previous error
        delete token.error
      } catch {
        // Refresh failed — mark the token so middleware can redirect to login
        token.error = "RefreshTokenExpired"
      }

      return token
    },

    /**
     * session — shapes the object returned by useSession() / getServerSession().
     * Runs after jwt() on every session read.
     */
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user = {
          ...session.user,
          name:         token.name  as string,
          email:        token.email as string,
          tenant_id:    token.tenant_id,
          plan:         token.plan,
          access_token: token.access_token,
        } as Session["user"]

        if (token.error) {
          session.error = token.error
        }
      }
      return session
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)