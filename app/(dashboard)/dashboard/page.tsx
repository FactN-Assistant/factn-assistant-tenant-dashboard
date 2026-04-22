'use client'

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and user doesn't exist, redirect to login
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }

    // If user is authenticated, redirect to dashboard/info
    if (!isLoading && user) {
      router.push("/dashboard/info");
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // This shouldn't be reached due to redirects above
  return null;
}