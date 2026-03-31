/**
 * types/auth.ts
 * ─────────────
 * TypeScript types mirroring the backend's response schemas.
 */

export interface AuthResponse {
  access_token: string
  token_type:   string
  tenant_id:    string
  email:        string
  name:         string
  plan:         "free" | "starter" | "pro" | "enterprise"
}

export interface SessionUser {
  tenant_id:    string
  email:        string
  name:         string
  plan:         "free" | "starter" | "pro" | "enterprise"
  access_token: string
}

export interface ApiError {
  detail: string
}