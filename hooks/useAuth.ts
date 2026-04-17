/**
 * hooks/useAuth.ts
 * -----------------
 * Authentication hook using TanStack Query for server state and Zustand for UI state.
 *
 * Session hydration:
 * - useQuery targets /api/auth/me on mount
 * - If access_token cookie is valid, returns tenant profile
 * - If expired, /api/auth/me automatically tries /api/auth/refresh
 * - If both fail, returns 401 and user is logged out
 *
 * This gives us transparent session persistence across hard refreshes.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/useAuthStore";
import { AuthUser, LoginFormData, SignupFormData, SignupPayload, userSchema } from "@/lib/schemas/auth-validations";

const AUTH_QUERY_KEY = ["auth", "me"];

/**
 * Custom hook that combines TanStack Query (server state) with Zustand (UI state).
 * Returns: { user, isLoading, loginMutation, registerMutation, logoutMutation, refresh }
 */
export function useAuth() {
  const { user, setUser, clear } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Hydrate from /api/auth/me on mount ──────────────────────
  const { isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async (): Promise<AuthUser> => {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch user: ${res.statusText}`);
      }

      const data = await res.json();
      return userSchema.parse(data);
    },
    // Don't retry on failure — if auth fails, user is logged out
    retry: false,
    // Cache for 15 minutes; queries older than this are stale
    staleTime: 15 * 60 * 1000,
    // Keep the last successful data while refetching in the background
    gcTime: 20 * 60 * 1000,
    // Run on mount
    enabled: !user?.tenant_id,
  });

  // ── Login mutation ──────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: async (payload: LoginFormData) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail ?? "Login failed");
      }

      const data = await res.json();

      console.log("response: ", data)

      return userSchema.parse(data);
    },
    onSuccess: (data) => {
      // Update Zustand store
      setUser(data);
      // Update query cache so next /api/auth/me is skipped
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
      // Redirect
      router.push("/dashboard");
    },
    // onError is handled in the component
  });

  // ── Register mutation ───────────────────────────────────────
  const registerMutation = useMutation({
    mutationFn: async (payload: SignupPayload) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail ?? "Registration failed");
      }

      const data = await res.json();
      return userSchema.parse(data);
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
      router.push("/dashboard");
    },
  });

  // ── Logout mutation ─────────────────────────────────────────
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      // Clear both Zustand store and query cache
      clear();
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
      router.push("/auth/login");
    },
    // Even if logout fails, clear local state
    onError: () => {
      clear();
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
      router.push("/auth/login");
    },
  });

  // ── Refresh helper (for programmatic refresh if needed) ──────
  const refresh = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        clear();
        queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
        router.push("/auth/login");
        return false;
      }

      const data = await res.json();
      const validated = userSchema.parse(data);
      setUser(validated);
      queryClient.setQueryData(AUTH_QUERY_KEY, validated);
      return true;
    } catch {
      clear();
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
      return false;
    }
  };

  return {
    user,
    isLoading,
    loginMutation,
    registerMutation,
    logoutMutation,
    refresh,
  };
}