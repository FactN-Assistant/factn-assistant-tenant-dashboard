/**
 * lib/auth.ts
 * -----------
 * Authentication types, Zod schemas, and Zustand store.
 *
 * WHY we store access_token in memory (not localStorage):
 * The httpOnly cookie is the secure long-term credential. We
 * keep the access_token in React state only so server-side
 * Route Handlers can forward it as a Bearer header without
 * reading the cookie (which JS cannot do). On page refresh
 * the memory store is cleared — the /api/auth/me Route Handler
 * re-hydrates it using the still-present httpOnly cookie.
 */

import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase()
    .min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export const signupPayloadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be 100 characters or fewer"),
});

export const signupSchema = signupPayloadSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const userSchema = z.object({
  tenant_id: z.string(),
  email: z.email(),
  name: z.string(),
  plan: z.enum(["free", "starter", "pro", "enterprise"]),
  access_token: z.string(),

  is_suspended: z.boolean().optional().default(false),
  created_at: z.string().optional(),
  plan_limits: z.record(z.string(), z.any()).optional().default({}),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupPayload = z.infer<typeof signupPayloadSchema>; // No confirmPassword
export type SignupFormData = z.infer<typeof signupSchema>; // Includes confirmPassword
export type AuthUser = z.infer<typeof userSchema>;