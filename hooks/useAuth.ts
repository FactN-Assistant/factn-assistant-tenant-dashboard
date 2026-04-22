/**
 * hooks/useAuth.ts
 * -----------------
 * Authentication hook using TanStack Query for all state management.
 *
 * Session hydration flow:
 * 1. useQuery calls /api/auth/me on mount
 * 2. If 200: returns user data (access_token is valid)
 * 3. If 401: tries /api/auth/refresh (using refresh_token from cookie)
 *    - If refresh succeeds: retries /api/auth/me with new access_token
 *    - If refresh fails: returns null (user is logged out)
 * 4. Other errors (5xx, network): throws to show error state
 *
 * All auth state is managed by React Query cache. Zustand is no longer needed.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AuthUser, LoginFormData, SignupPayload, userSchema } from "@/lib/schemas/auth-validations";

const AUTH_QUERY_KEY = ["auth", "me"];

/**
 * Custom hook that manages all auth operations via TanStack Query.
 * Returns: { user, isLoading, loginMutation, registerMutation, logoutMutation, refresh, error }
 */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Hydrate from /api/auth/me on mount ──────────────────────
  const { data: user, isLoading, error } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async (): Promise<AuthUser | null> => {
      const fetchUser = async (): Promise<Response> => {
        return fetch("/api/auth/me", { credentials: "include" });
      };

      let res = await fetchUser();

      // If 401, try to refresh the token using refresh_token
      if (res.status === 401) {
        try {
          const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          });

          if (!refreshRes.ok) {
            return null;
          }

          res = await fetchUser();
        } catch {
          // Network error during refresh attempt
          return null;
        }
      }

      // If still not ok after refresh attempt, something went wrong
      if (!res.ok) {
        throw new Error(`Failed to fetch user: ${res.statusText}`);
      }

      const data = await res.json();

      // Log validation errors for debugging
      try {
        return userSchema.parse(data);
      } catch (validationError) {
        console.error(
          "[useAuth] Zod validation failed for /api/auth/me response:",
          validationError,
          "Response data was:",
          data
        );
        throw validationError;
      }
    },
    // Don't retry on failure — we've already tried refresh
    retry: false,
    // Cache for 15 minutes; queries older than this are stale
    staleTime: 15 * 60 * 1000,
    // Keep the last successful data while refetching in the background
    gcTime: 20 * 60 * 1000,
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
      return userSchema.parse(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
      router.push("/");
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
      // Clear the entire cache so no data from the previous account leaks
      // into the next session (e.g. projects, keys, usage, sessions).
      queryClient.clear();
      router.push("/auth/login");
    },
    // Even if logout fails, clear local state
    onError: () => {
      queryClient.clear();
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
        queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
        router.push("/auth/login");
        return false;
      }

      const data = await res.json();
      const validated = userSchema.parse(data);
      queryClient.setQueryData(AUTH_QUERY_KEY, validated);
      return true;
    } catch {
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
      return false;
    }
  };

  return {
    user,
    isLoading,
    error,
    loginMutation,
    registerMutation,
    logoutMutation,
    refresh,
  };
}