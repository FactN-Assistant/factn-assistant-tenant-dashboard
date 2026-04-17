/**
 * lib/useProjectStore.ts
 * ----------------------
 * Zustand store for the currently selected project and the user's project list.
 *
 * Note: The auth user data is now managed by React Query (useAuthUser hook).
 * This store still uses Zustand for project state management:
 *  - state lives in memory only (no localStorage)
 *  - the store is populated by ProjectProvider / the ProjectSelector component
 *  - other pages (SystemPrompt, VoiceConfig, Tools, …) read from this store
 *    instead of making their own fetch calls
 */

import { create } from "zustand";

// ── Shapes ────────────────────────────────────────────────────

export interface VoiceConfig {
  enabled: boolean;
  voice_name: string;
  language_code: string;
}

export interface VADConfig {
  mode: "manual" | "auto";
}

export interface Project {
  project_id: string;
  tenant_id: string;
  name: string;
  description: string;
  system_prompt: string;
  gemini_model: string;
  voice_config: VoiceConfig;
  vad_config: VADConfig;
  tools: object[];
  webhook_url: string | null;
  allowed_origins: string[];
  session_ttl_seconds: number;
  max_concurrent_sessions: number;
  rate_limit_rpm: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Store interface ───────────────────────────────────────────

interface ProjectState {
  /** All projects owned by the current tenant */
  projects: Project[];
  /** The project the user has actively selected */
  selectedProject: Project | null;
  /** True while the project list is being fetched */
  isLoadingList: boolean;
  /** True while a single project's details are being fetched */
  isLoadingDetail: boolean;
  /** Non-null when any project fetch has failed */
  error: string | null;

  // Setters used by the data-fetching layer
  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  setLoadingList: (v: boolean) => void;
  setLoadingDetail: (v: boolean) => void;
  setError: (msg: string | null) => void;
  /** Full reset (e.g. on logout) */
  clear: () => void;
}

// ── Store ─────────────────────────────────────────────────────

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  selectedProject: null,
  isLoadingList: false,
  isLoadingDetail: false,
  error: null,

  setProjects: (projects) => set({ projects }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  setLoadingList: (v) => set({ isLoadingList: v }),
  setLoadingDetail: (v) => set({ isLoadingDetail: v }),
  setError: (msg) => set({ error: msg }),
  clear: () =>
    set({
      projects: [],
      selectedProject: null,
      isLoadingList: false,
      isLoadingDetail: false,
      error: null,
    }),
}));