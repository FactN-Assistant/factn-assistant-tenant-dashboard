/**
 * lib/schemas/plan-schemas.ts
 * ────────────────────────────
 * Zod schemas and inferred types for plan-related data.
 * Mirrors the backend PlanResponse / CurrentPlanResponse shapes.
 */

import { z } from "zod";

export const planSchema = z.object({
  name: z.string(),
  concurrent_sessions: z.number().nullable(),
  session_ttl_seconds: z.number(),
  projects: z.number().nullable(),
  tools_per_project: z.number().nullable(),
  daily_token_quota: z.number().nullable(),
  webhook_timeout_ms: z.number(),
  rate_limit_rpm: z.number().nullable(),
});

export const currentPlanSchema = z.object({
  plan: z.string(),
  limits: planSchema,
});

export type Plan = z.infer<typeof planSchema>;
export type CurrentPlan = z.infer<typeof currentPlanSchema>;
