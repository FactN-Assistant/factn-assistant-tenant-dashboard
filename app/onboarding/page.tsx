"use client";

import { Sparkles } from "lucide-react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";
import type { CreateProjectFormValues } from "@/hooks/useProject";
import CreateProjectModal from "@/components/admin/create-project-modal";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { projects, isLoadingList, createProjectMutation } = useProject();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
  }, [user, authLoading, router]);

  // If the user already has projects, send them to the most recent one
  useEffect(() => {
    if (!authLoading && !isLoadingList && user && projects.length > 0) {
      const mostRecent = projects.reduce<(typeof projects)[number] | null>(
        (best, p) => {
          if (!p.last_accessed) return best;
          if (!best || !best.last_accessed) return p;
          return p.last_accessed > best.last_accessed ? p : best;
        },
        null
      );
      const targetId = mostRecent?.project_id ?? projects[0].project_id;
      router.replace(`/${targetId}/info`);
    }
  }, [user, authLoading, isLoadingList, projects, router]);

  const modalOpen = !authLoading && !isLoadingList && !!user && projects.length === 0;

  if (authLoading || isLoadingList) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  const handleCreate = (data: CreateProjectFormValues) => {
    createProjectMutation.mutate(data, {
      onSuccess: (newProject) => {
        router.push(`/${newProject.project_id}/info`);
      },
    });
  };

  return (
    <div className="brand-shell flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <div className="brand-panel flex w-full max-w-2xl flex-col items-center gap-6 p-8 text-center sm:p-10">
        <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/12 text-primary">
          <Sparkles className="size-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to FACTn Assistant
          </h1>
          <p className="text-muted-foreground text-sm">
          Create your first project to get started.
          </p>
        </div>

        <CreateProjectModal
          isOpen={modalOpen}
          onOpenChange={() => {
            // Keep modal open — a project is required to proceed
          }}
          onSave={handleCreate}
          isSubmitting={createProjectMutation.isPending}
        />
      </div>
    </div>
  );
}
