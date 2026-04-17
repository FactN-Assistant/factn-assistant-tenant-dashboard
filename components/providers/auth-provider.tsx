/**
 * components/AuthProvider.tsx
 * ----------------------------
 * Wraps the app with TanStack Query and triggers session hydration on mount.
 * Place this inside your root layout.tsx.
 *
 * This provider:
 *  1. Sets up QueryClientProvider for TanStack Query
 *  2. Runs useAuth() which hydrates session from /api/auth/me on mount
 *  3. Makes auth state available to all child components
 *
 * Usage:
 *   // app/layout.tsx
 *   import { AuthProvider } from "@/components/AuthProvider";
 *   export default function RootLayout({ children }) {
 *     return <html><body><AuthProvider>{children}</AuthProvider></body></html>;
 *   }
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ReactNode, useState } from "react";

/**
 * Inner component that uses the auth hook.
 * Separated from the provider so QueryClientProvider is above it.
 */
function AuthHydrator({ children }: { children: ReactNode }) {
  // This useEffect-like hook runs /api/auth/me on mount to re-hydrate from cookies
  useAuth();
  return <>{children}</>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Create QueryClient once per provider instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator>{children}</AuthHydrator>
    </QueryClientProvider>
  );
}