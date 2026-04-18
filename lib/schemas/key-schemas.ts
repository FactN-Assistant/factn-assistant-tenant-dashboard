/**
 * lib/schemas/key-schemas.ts
 * ───────────────────────────
 * Zod schemas and inferred types for API keys and ephemeral tokens.
 * Replaces all interfaces from lib/keysApi.ts and key-related types from lib/types.ts.
 */

import { z } from "zod";

// API Key (list response)
export const apiKeySchema = z.object({
  key_id: z.string(),
  key_prefix: z.string(),
  key_type: z.enum(["publishable", "secret"]),
  label: z.string(),
  rate_limit_rpm: z.number(),
  revoked: z.boolean(),
  created_at: z.string(),
  last_used_at: z.string().nullable(),
});

// Created key (POST response — includes raw_key shown once)
export const createdKeySchema = z.object({
  key_id: z.string(),
  raw_key: z.string(),
  key_prefix: z.string(),
  key_type: z.enum(["publishable", "secret"]),
  label: z.string(),
  rate_limit_rpm: z.number(),
  created_at: z.string(),
});

// Create key form
export const createKeyFormSchema = z.object({
  label: z.string().min(1, "Label is required"),
  key_type: z.enum(["publishable", "secret"]),
  rate_limit_rpm: z.number().int().min(1).max(1000),
});

// Mint token form (what the form manages)
export const mintTokenFormSchema = z.object({
  ttl_seconds: z.number().int().min(1).max(300),
  metadata_raw: z.string().default(""),
});

// Minted token response
export const mintedTokenSchema = z.object({
  ephemeral_token: z.string(),
  expires_at: z.number(),
  ttl_seconds: z.number(),
  project_id: z.string(),
});


// Rotated token response
export const rotatedTokenSchema = mintedTokenSchema.extend({
  previous_remaining_ttl: z.number(),
});


export type ApiKey = z.infer<typeof apiKeySchema>;
export type CreatedKey = z.infer<typeof createdKeySchema>;
export type CreateKeyForm = z.infer<typeof createKeyFormSchema>;
export type MintTokenForm = z.infer<typeof mintTokenFormSchema>;
export type MintedToken = z.infer<typeof mintedTokenSchema>;
export type RotatedToken = z.infer<typeof rotatedTokenSchema>;
