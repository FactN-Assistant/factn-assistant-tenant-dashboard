/**
 * components/AuthProvider.tsx
 * ----------------------------
 * Wraps the app with TanStack Query for state management.
 * Place this inside your root layout.tsx.
 *
 * This provider:
 *  1. Sets up QueryClientProvider for TanStack Query
 *  2. Makes auth state available to all components via useAuth() hook
 *  3. useAuth() automatically runs hydration query on first mount in any component
 *
 * Note: We don't need a separate "AuthHydrator" component because:
 *  - useAuth() is a useQuery hook that runs automatically on mount
 *  - Child components (like LoggedUser, nav-user) call useAuth()
 *  - The query will start as soon as any component needs the data
 *  - React Query deduplicates requests automatically
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
import { ReactNode, useState } from "react";

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
      {children}
    </QueryClientProvider>
  );
}