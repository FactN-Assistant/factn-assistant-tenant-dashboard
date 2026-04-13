/**
 * lib/auth.ts
 * -----------
 * Types and a simple in-memory auth store (Zustand).
 *
 * WHY we store access_token in memory (not localStorage):
 * The httpOnly cookie is the secure long-term credential. We
 * keep the access_token in React state only so server-side
 * Route Handlers can forward it as a Bearer header without
 * reading the cookie (which JS cannot do). On page refresh
 * the memory store is cleared — the /api/auth/me Route Handler
 * re-hydrates it using the still-present httpOnly cookie.
 */

export interface AuthUser {
  tenant_id: string;
  email: string;
  name: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  access_token: string;         // stored in memory only, NOT localStorage
}
 
export interface AuthResponse {
  access_token: string;
  token_type: string;
  tenant_id: string;
  email: string;
  name: string;
  plan: string;
}
 
export interface LoginPayload {
  email: string;
  password: string;
}
 
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}