/**
 * lib/schemas/project-schemas.ts
 * ──────────────────────────────
 * Zod schemas and inferred types for project-related data.
 * Mirrors the backend ProjectDoc / ProjectResponse shapes.
 */

import { z } from "zod";

// Voice & VAD config
export const voiceConfigSchema = z.object({
  enabled: z.boolean(),
  voice_name: z.string(),
  language_code: z.string(),
});

export const vadConfigSchema = z.object({
  mode: z.enum(["manual", "auto"]),
});

// Project
export const projectSchema = z.object({
  project_id: z.string(),
  tenant_id: z.string(),
  name: z.string(),
  description: z.string(),
  system_prompt: z.string(),
  gemini_model: z.string(),
  voice_config: voiceConfigSchema,
  vad_config: vadConfigSchema,
  tools: z.array(z.record(z.string(), z.any())).default([]),
  webhook_url: z.string().nullable().default(null),
  allowed_origins: z.array(z.string()).default([]),
  session_ttl_seconds: z.number(),
  max_concurrent_sessions: z.number(),
  rate_limit_rpm: z.number(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const voiceFormSchema = z.object({
  voice_enabled: z.boolean(),
  voice_name: z.string(),
  language_code: z.string(),
  vad_mode: z.enum(["manual", "auto"])
})

// Create project form
export const createProjectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(100, "Project name must be 100 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .default(""),
  gemini_model: z.string().min(1, "Model is required"),
  webhook_url: z.string().default(""),
  webhook_secret: z.string().default(""),
  allowed_origins: z.string().default(""),
});

export type VoiceConfig = z.infer<typeof voiceConfigSchema>;
export type VADConfig = z.infer<typeof vadConfigSchema>;
export type Project = z.infer<typeof projectSchema>;
export type VoiceFormValues = z.infer<typeof voiceFormSchema>;
export type CreateProjectFormValues = z.infer<typeof createProjectFormSchema>;