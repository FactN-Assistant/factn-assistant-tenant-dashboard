/**
 * lib/schemas/tool-schemas.ts
 * ───────────────────────────
 * Zod schemas and inferred types for tool CRUD operations.
 * Mirrors the backend CreateToolRequest, UpdateToolRequest, and ToolResponse.
 */

import { z } from "zod";

// ── Tool parameter (form-level representation) ────────────────

export const toolParameterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Parameter name is required")
    .max(100, "Parameter name must be 100 characters or fewer"),
  type: z.enum(["string", "number", "integer", "boolean", "array", "object"]),
  description: z
    .string()
    .trim()
    .min(1, "Parameter description is required")
    .max(500, "Parameter description must be 500 characters or fewer"),
  required: z.boolean(),
});

// ── Tool form values (what React Hook Form manages) ───────────

export const toolFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Tool name is required")
      .max(64, "Tool name must be 64 characters or fewer")
      .regex(
        /^[a-z][a-z0-9_]*$/,
        "Must start with lowercase letter, only lowercase, numbers, and underscores"
      ),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(1000, "Description must be 1,000 characters or fewer"),
    execution_mode: z.enum(["static", "webhook"]),
    parameters: z.array(toolParameterSchema).default([]),
    static_response: z.string().default(""),
    webhook_url: z.string().default(""),
    webhook_secret: z.string().default(""),
    timeout_ms: z
      .number()
      .int("Timeout must be a whole number")
      .min(100, "Timeout must be at least 100 ms")
      .max(30000, "Timeout must be at most 30,000 ms"),
  })
  .refine(
    (data) => {
      if (data.execution_mode === "static") {
        if (!data.static_response.trim()) return false;
        try {
          JSON.parse(data.static_response);
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: "Valid JSON is required for static response",
      path: ["static_response"],
    }
  )
  .refine(
    (data) =>
      data.execution_mode !== "webhook" || data.webhook_url.trim().length > 0,
    {
      message: "Webhook URL is required for webhook execution mode",
      path: ["webhook_url"],
    }
  );

// ── API response schema (what the backend returns) ────────────

export const toolResponseSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.string(), z.any()),
  execution_mode: z.enum(["static", "webhook"]),
  static_response: z.record(z.string(), z.any()).nullable().optional(),
  webhook_url: z.string().nullable().optional(),
  timeout_ms: z.number(),
});

// ── Mutation payload schemas ──────────────────────────────────

export const createToolPayloadSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  execution_mode: z.enum(["static", "webhook"]),
  parameters: z.array(toolParameterSchema),
  static_response: z.string().default(""),
  webhook_url: z.string().default(""),
  webhook_secret: z.string().default(""),
  timeout_ms: z.number().int().min(100).max(30000),
});

export const updateToolPayloadSchema = z.object({
  toolName: z.string().min(1),
  description: z.string().optional(),
  execution_mode: z.enum(["static", "webhook"]).optional(),
  parameters: z.array(toolParameterSchema).optional(),
  static_response: z.string().optional(),
  webhook_url: z.string().optional(),
  webhook_secret: z.string().optional(),
  timeout_ms: z.number().int().min(100).max(30000).optional(),
});

// ── Inferred types ────────────────────────────────────────────

export type ToolParameter = z.infer<typeof toolParameterSchema>;
export type ToolFormValues = z.infer<typeof toolFormSchema>;
export type ToolResponse = z.infer<typeof toolResponseSchema>;
export type CreateToolPayload = z.infer<typeof createToolPayloadSchema>;
export type UpdateToolPayload = z.infer<typeof updateToolPayloadSchema>;