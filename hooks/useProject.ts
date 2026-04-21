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
import toast from "react-hot-toast";
import { useAuth } from "./useAuth";
import { useFetch } from "./useFetch";
import {
  projectSchema,
  usageSummarySchema,
  sessionsResponseSchema,
  type Project,
  type CreateProjectFormValues,
  type UsageSummary,
  type SessionsResponse,
} from "@/lib/schemas/project-schemas";
import { z } from "zod";

export type { Project, CreateProjectFormValues, UsageSummary, SessionsResponse };

const PROJECTS_LIST_KEY = ["projects", "list"];
const SELECTED_PROJECT_ID_KEY = ["projects", "selectedId"];
const PROJECT_DETAIL_KEY = ["projects", "detail"];
const USAGE_KEY = ["projects", "usage"];
const SESSIONS_KEY = ["projects", "sessions"];

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
      toast.success("System prompt saved successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message);
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
      toast.success("Voice configuration saved");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // ── 7. Create project mutation ─────────────────────────────

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectFormValues): Promise<Project> => {
      const body: Record<string, any> = {
        name: data.name,
        description: data.description,
        system_prompt: "You are a helpful assistant.",
        gemini_model: data.gemini_model,
      };
      if (data.webhook_url?.trim()) body.webhook_url = data.webhook_url.trim();
      if (data.webhook_secret?.trim()) body.webhook_secret = data.webhook_secret.trim();
      if (data.allowed_origins?.trim()) {
        body.allowed_origins = data.allowed_origins
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean);
      }
      const res = await fetchWithRefresh<unknown>("/projects", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return projectSchema.parse(res);
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_LIST_KEY });
      queryClient.setQueryData(SELECTED_PROJECT_ID_KEY, newProject.project_id);
      toast.success(`Project "${newProject.name}" created`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // ── 8. Update project info mutation ────────────────────────

  const updateProjectInfoMutation = useMutation({
    mutationFn: async (data: CreateProjectFormValues): Promise<Project> => {
      const body: Record<string, any> = {
        name: data.name,
        description: data.description,
        gemini_model: data.gemini_model,
      };
      if (data.webhook_url?.trim()) {
        body.webhook_url = data.webhook_url.trim();
      } else {
        body.webhook_url = null;
      }
      if (data.webhook_secret?.trim()) {
        body.webhook_secret = data.webhook_secret.trim();
      }
      body.allowed_origins = data.allowed_origins
        ? data.allowed_origins.split(",").map((o) => o.trim()).filter(Boolean)
        : [];
      const res = await fetchWithRefresh<unknown>(
        `/projects/${effectiveSelectedId}`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
        }
      );
      return projectSchema.parse(res);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_DETAIL_KEY, effectiveSelectedId] });
      toast.success(`Project "${updated.name}" updated`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // ── 9. Usage summary query ─────────────────────────────────

  const {
    data: usage = null,
    isLoading: isLoadingUsage,
  } = useQuery<UsageSummary>({
    queryKey: [...USAGE_KEY, effectiveSelectedId],
    queryFn: async (): Promise<UsageSummary> => {
      const res = await fetch(`/api/projects/${effectiveSelectedId}/usage`, {
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? "Failed to load usage");
      }
      const data = await res.json();
      return usageSummarySchema.parse(data);
    },
    enabled: !!user && !!effectiveSelectedId,
    staleTime: 60 * 1000,
    retry: false,
  });

  // ── 10. Sessions list query ────────────────────────────────

  const {
    data: sessionsData = null,
    isLoading: isLoadingSessions,
  } = useQuery<SessionsResponse>({
    queryKey: [...SESSIONS_KEY, effectiveSelectedId],
    queryFn: async (): Promise<SessionsResponse> => {
      const res = await fetch(`/api/projects/${effectiveSelectedId}/sessions?limit=50`, {
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? "Failed to load sessions");
      }
      const data = await res.json();
      return sessionsResponseSchema.parse(data);
    },
    enabled: !!user && !!effectiveSelectedId,
    staleTime: 60 * 1000,
    retry: false,
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
    createProjectMutation,
    updateProjectInfoMutation,
    usage,
    isLoadingUsage,
    sessionsData,
    isLoadingSessions,
  };
}