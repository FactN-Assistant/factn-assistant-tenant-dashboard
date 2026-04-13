/**
 * lib/useAuthStore.ts
 * --------------------
 * Zustand store for in-memory auth state.
 *
 * The access_token is kept in memory (not localStorage) because:
 *  - localStorage is vulnerable to XSS attacks
 *  - The real security credential is the httpOnly cookie
 *  - On page refresh this store resets to null — useAuth() 
 *    calls /api/auth/me to re-hydrate from the cookie
 *
 * Token in memory is for: attaching as Bearer header to
 * server-side fetch calls (Server Components, API routes).
 */

import { create } from "zustand";
import { AuthUser } from "./auth";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (v: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (v) => set({ isLoading: v }),
  clear: () => set({ user: null, isLoading: false }),
}))