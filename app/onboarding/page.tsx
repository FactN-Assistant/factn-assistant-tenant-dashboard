"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";
import type { CreateProjectFormValues } from "@/hooks/useProject";
import CreateProjectModal from "@/components/admin/create-project-modal";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { projects, isLoadingList, createProjectMutation } = useProject();
  const [modalOpen, setModalOpen] = useState(false);

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

  // Show the create modal once we know the user is authenticated with no projects
  useEffect(() => {
    if (!authLoading && !isLoadingList && user && projects.length === 0) {
      setModalOpen(true);
    }
  }, [user, authLoading, isLoadingList, projects]);

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
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
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
  );
}
