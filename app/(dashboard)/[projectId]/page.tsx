'use client'

import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Dashboard entry point that:
 * 1. Checks authentication
 * 2. If no projectId param, fetches projects and redirects to most recently accessed
 * 3. If projectId exists and is valid (UUID), redirects to that project's info page
 */

// Helper to check if a string looks like a UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const projectIdParam = typeof params?.projectId === "string" ? params.projectId : null;
  // Only treat projectId as valid if it's a proper UUID
  const projectId = projectIdParam && isValidUUID(projectIdParam) ? projectIdParam : null;
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // If not loading and user doesn't exist, redirect to login
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (!authLoading && user && !isRedirecting) {
      // Case 1: projectId exists in URL
      if (projectId) {
        router.push(`/${projectId}/info`);
        return;
      }

      // Case 2: No projectId, fetch projects to find the most recent one
      const fetchAndRedirect = async () => {
        try {
          setIsRedirecting(true);
          const res = await fetch("/api/projects", { credentials: "include" });
          if (!res.ok) {
            throw new Error("Failed to fetch projects");
          }
          const projects = await res.json();

          if (Array.isArray(projects) && projects.length > 0) {
            // Find the project with the latest last_accessed timestamp
            const mostRecent = projects.reduce((best, p) => {
              if (!p.last_accessed) return best;
              if (!best || !best.last_accessed) return p;
              return p.last_accessed > best.last_accessed ? p : best;
            }, null);

            const targetProjectId = mostRecent?.project_id ?? projects[0].project_id;
            router.push(`/${targetProjectId}/info`);
          } else {
            // No projects exist yet — redirect to create project page or home
            router.push("/");
          }
        } catch (error) {
          console.error("Error redirecting to project:", error);
          router.push("/auth/login");
        }
      };

      fetchAndRedirect();
    }
  }, [user, authLoading, isRedirecting, projectId, router]);

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
