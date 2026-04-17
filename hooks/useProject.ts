/**
 * hooks/useProject.ts
 * --------------------
 * Hook that drives all project-related data fetching.
 *
 * On mount it:
 *   1. Fetches GET /v1/projects  → populates the project list
 *   2. Auto-selects the first project (or keeps the previously selected one)
 *   3. Fetches GET /v1/projects/{id} for the selected project's full details
 *
 * Calling selectProject(id) switches the active project and re-fetches its details.
 *
 * Auth note:
 *   All calls go through /api/... (Next.js proxy) with credentials:"include" so the
 *   httpOnly access_token cookie is forwarded automatically — same pattern as useFetch.
 */

"use client";

import { useCallback, useEffect } from "react";
import { useProjectStore, Project } from "@/lib/useProjectStore";
import { useFetch } from "./useFetch";
import { useAuth } from "./useAuth";

const BASE = "/projects";

export function useProject() {
  const { user } = useAuth();
  const fetchWithAuth = useFetch();
  const {
    projects,
    selectedProject,
    isLoadingList,
    isLoadingDetail,
    error,
    setProjects,
    setSelectedProject,
    setLoadingList,
    setLoadingDetail,
    setError,
    clear,
  } = useProjectStore();

  // ── Fetch full detail for a single project ────────────────

  const fetchProjectDetail = useCallback(
    async (projectId: string) => {
      setLoadingDetail(true);
      setError(null);
      try {
        const detail = await fetchWithAuth<Project>(`${BASE}/${projectId}`);
        setSelectedProject(detail);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setLoadingDetail(false);
      }
    },
    [fetchWithAuth, setLoadingDetail, setError, setSelectedProject]
  );

  // ── Fetch the project list on mount (once per session) ────

  useEffect(() => {
    if (!user) {
      clear();
      return;
    }
    // Skip if we already have projects loaded
    if (projects.length > 0) return;

    (async () => {
      setLoadingList(true);
      setError(null);
      try {
        const list = await fetchWithAuth<Project[]>(BASE);
        setProjects(list);

        // Auto-select: keep current selection if still valid, else pick first
        const currentId = useProjectStore.getState().selectedProject?.project_id;
        const stillValid = list.some((p) => p.project_id === currentId);

        if (!stillValid && list.length > 0) {
          // Load full detail for the first project
          await fetchProjectDetail(list[0].project_id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setLoadingList(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Public API: switch to a different project ─────────────

  const selectProject = useCallback(
    async (projectId: string) => {
      // Optimistically set a lightweight "stub" from the list while we fetch details
      const stub = projects.find((p) => p.project_id === projectId);
      if (stub) setSelectedProject(stub);

      await fetchProjectDetail(projectId);
    },
    [projects, setSelectedProject, fetchProjectDetail]
  );

  return {
    projects,
    selectedProject,
    isLoadingList,
    isLoadingDetail,
    error,
    selectProject,
  };
}