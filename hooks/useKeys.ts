/**
 * hooks/useKeys.ts
 * -----------------
 * Hook that manages API-key CRUD and ephemeral-token operations
 * using TanStack Query.
 *
 * Provides:
 *   - keys list query (auto-fetches when projectId is available)
 *   - createKey mutation  (returns CreatedKey with raw_key)
 *   - revokeKey mutation
 *   - mintToken mutation   (uses secret-key auth, not cookies)
 *   - rotateToken mutation (uses secret-key auth, not cookies)
 *
 * All key mutations auto-invalidate the keys list query on success.
 * Toast notifications via react-hot-toast.
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  apiKeySchema,
  createdKeySchema,
  mintedTokenSchema,
  rotatedTokenSchema,
  type ApiKey,
  type CreatedKey,
  type CreateKeyForm,
  type MintedToken,
  type RotatedToken,
} from "@/lib/schemas/key-schemas";
import { useFetch } from "./useFetch";

export type { ApiKey, CreatedKey, CreateKeyForm, MintedToken, RotatedToken };

const KEYS_QUERY_KEY = "keys";

/**
 * Custom hook that manages all key & token operations via TanStack Query.
 *
 * @param projectId - The project to scope key operations to.
 *                    Pass empty string if no project is selected yet.
 */
export function useKeys(projectId: string) {
  const queryClient = useQueryClient();
  const fetchWithRefresh = useFetch();

  const keysQueryKey = [KEYS_QUERY_KEY, projectId];

  // ── Fetch keys list ────────────────────────────────────────

  const {
    data: keys = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: keysQueryKey,
    queryFn: async (): Promise<ApiKey[]> => {
      const data = await fetchWithRefresh<unknown[]>(
        `/projects/${projectId}/keys`
      );
      return z.array(apiKeySchema).parse(data);
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });

  // ── Create key ─────────────────────────────────────────────

  const createKeyMutation = useMutation({
    mutationFn: async (data: CreateKeyForm): Promise<CreatedKey> => {
      const res = await fetchWithRefresh<unknown>(
        `/projects/${projectId}/keys`,
        { method: "POST", body: JSON.stringify(data) }
      );
      return createdKeySchema.parse(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keysQueryKey });
      toast.success("API key created");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create key");
    },
  });

  // ── Revoke key ─────────────────────────────────────────────

  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string): Promise<void> => {
      await fetchWithRefresh(`/projects/${projectId}/keys/${keyId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keysQueryKey });
      toast.success("API key revoked");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to revoke key");
    },
  });

  // ── Mint ephemeral token ───────────────────────────────────

  const mintTokenMutation = useMutation({
    mutationFn: async ({
      secretKey,
      ttl_seconds,
      metadata,
    }: {
      secretKey: string;
      ttl_seconds: number;
      metadata: Record<string, string>;
    }): Promise<MintedToken> => {
      const res = await fetchWithRefresh<unknown>("/tokens", {
        method: "POST",
        headers: { Authorization: `Bearer ${secretKey}` },
        body: JSON.stringify({ ttl_seconds, metadata }),
      });
      return mintedTokenSchema.parse(res);
    },
    onSuccess: () => {
      toast.success("Ephemeral token minted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to mint token");
    },
  });

  // ── Rotate ephemeral token ─────────────────────────────────

  const rotateTokenMutation = useMutation({
    mutationFn: async ({
      secretKey,
      current_token,
      ttl_seconds,
    }: {
      secretKey: string;
      current_token: string;
      ttl_seconds: number;
    }): Promise<RotatedToken> => {
      const res = await fetchWithRefresh<unknown>("/tokens/rotate", {
        method: "POST",
        headers: { Authorization: `Bearer ${secretKey}` },
        body: JSON.stringify({ current_token, ttl_seconds }),
      });
      return rotatedTokenSchema.parse(res);
    },
    onSuccess: () => {
      toast.success("Token rotated");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to rotate token");
    },
  });

  return {
    keys,
    isLoading,
    queryError,
    createKeyMutation,
    revokeKeyMutation,
    mintTokenMutation,
    rotateTokenMutation,
  };
}
