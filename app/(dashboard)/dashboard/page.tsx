'use client'

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // If not loading and user doesn't exist, redirect to login
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    // If user is authenticated, fetch projects to redirect to first one
    if (!authLoading && user && !isRedirecting) {
      const fetchAndRedirect = async () => {
        try {
          setIsRedirecting(true);
          const res = await fetch("/api/projects", { credentials: "include" });
          if (!res.ok) {
            throw new Error("Failed to fetch projects");
          }
          const projects = await res.json();
          
          if (Array.isArray(projects) && projects.length > 0) {
            router.push(`/${projects[0].project_id}`);
          } else {
            // No projects, show error or redirect to create project
            router.push("/dashboard");
          }
        } catch (error) {
          console.error("Error redirecting to project:", error);
          router.push("/auth/login");
        }
      };
      
      fetchAndRedirect();
    }
  }, [user, authLoading, isRedirecting, router]);

  // Show loading state while checking authentication and redirecting
  if (authLoading || isRedirecting) {
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