/**
 * hooks/useProject.ts
 * --------------------
 * Hook that drives all project-related data fetching using TanStack Query.
 *
 * On mount it:
 *   1. Fetches GET /api/projects → populates the project list
 *   2. Auto-selects the first project (or keeps the previously selected one)
 *   3. Fetches GET /api/projects/{id} for the selected project's full details
 *
 * Calling selectProject(id) switches the active project and re-fetches its details.
 *
 * All state is managed by React Query cache. Zustand is no longer needed.
 */

"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useFetch } from "./useFetch";
import { projectSchema, type Project } from "@/lib/schemas/project-schemas";
import { z } from "zod";

export type { Project };

const PROJECTS_LIST_KEY = ["projects", "list"];
const SELECTED_PROJECT_ID_KEY = ["projects", "selectedId"];
const PROJECT_DETAIL_KEY = ["projects", "detail"];

/**
 * Custom hook that manages all project operations via TanStack Query.
 *
 * Returns the exact same shape as the old Zustand-based version so
 * consuming components (prompt, tools, keys, voice-config, project-selector)
 * continue to work without changes.
 */
export function useProject() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fetchWithRefresh = useFetch();

  // ── 1. Fetch project list ──────────────────────────────────

  const {
    data: projects = [],
    isLoading: isLoadingList,
    error: listError,
  } = useQuery({
    queryKey: PROJECTS_LIST_KEY,
    queryFn: async (): Promise<Project[]> => {
      const res = await fetch("/api/projects", { credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? "Failed to load projects");
      }
      const data = await res.json();
      return z.array(projectSchema).parse(data);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });

  // ── 2. Read / write selectedProjectId from query cache ─────

  const { data: selectedProjectId } = useQuery<string | null>({
    queryKey: SELECTED_PROJECT_ID_KEY,
    queryFn: () => null,
    enabled: false, // never fetches — purely client-side state
    staleTime: Infinity,
  });

  // Auto-select: if no project is selected and the list is loaded, pick the first
  const effectiveSelectedId =
    selectedProjectId && projects.some((p) => p.project_id === selectedProjectId)
      ? selectedProjectId
      : projects[0]?.project_id ?? null;

  // ── 3. Fetch detail for the selected project ───────────────

  const {
    data: selectedProject = null,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useQuery({
    queryKey: [...PROJECT_DETAIL_KEY, effectiveSelectedId],
    queryFn: async (): Promise<Project> => {
      const res = await fetch(`/api/projects/${effectiveSelectedId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? "Failed to load project");
      }
      const data = await res.json();
      return projectSchema.parse(data);
    },
    enabled: !!user && !!effectiveSelectedId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });

  // ── 4. selectProject: switch the active project ────────────

  const selectProject = useCallback(
    (projectId: string) => {
      queryClient.setQueryData(SELECTED_PROJECT_ID_KEY, projectId);
    },
    [queryClient]
  );

  // ── 5. Update system prompt mutation ───────────────────────

  const updateSystemPromptMutation = useMutation({
    mutationFn: async (systemPrompt: string) => {
      await fetchWithRefresh(`/projects/${effectiveSelectedId}/system-prompt`, {
        method: "PUT",
        body: JSON.stringify({ system_prompt: systemPrompt }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECT_DETAIL_KEY, effectiveSelectedId] });
    },
  });

  // ── 6. Update voice config mutation ────────────────────────

  const updateVoiceConfigMutation = useMutation({
    mutationFn: async (config: {
      voice_name: string;
      language_code: string;
      enabled: boolean;
      vad_mode: string;
    }) => {
      await fetchWithRefresh(`/projects/${effectiveSelectedId}/voice-config`, {
        method: "PUT",
        body: JSON.stringify(config),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECT_DETAIL_KEY, effectiveSelectedId] });
    },
  });

  // ── Combine errors ────────────────────────────────────────

  const error = listError || detailError
    ? (listError?.message ?? detailError?.message ?? "Unknown error")
    : null;

  return {
    projects,
    selectedProject,
    isLoadingList,
    isLoadingDetail,
    error,
    selectProject,
    updateSystemPromptMutation,
    updateVoiceConfigMutation,
  };
}