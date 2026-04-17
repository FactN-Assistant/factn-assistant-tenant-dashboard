/**
 * lib/keysApi.ts
 * ───────────────
 * API client for API keys and ephemeral tokens.
 *
 * Routes:
 *   POST   /v1/projects/{project_id}/keys
 *   GET    /v1/projects/{project_id}/keys
 *   DELETE /v1/projects/{project_id}/keys/{key_id}
 *   POST   /v1/tokens (authenticated with secret key)
 *   POST   /v1/tokens/rotate (authenticated with secret key)
 */

import { apiFetch, ApiError } from "./api";

/**
 * API Key response from list endpoint
 */
export interface ApiKeyResponse {
  key_id: string;
  key_prefix: string;
  key_type: "publishable" | "secret";
  label: string;
  rate_limit_rpm: number;
  revoked: boolean;
  created_at: string;
  last_used_at: string | null;
}

/**
 * API Key response from creation (includes raw key, shown only once)
 */
export interface CreatedKeyResponse {
  key_id: string;
  raw_key: string;
  key_prefix: string;
  key_type: "publishable" | "secret";
  label: string;
  rate_limit_rpm: number;
  created_at: string;
}

/**
 * Request for creating a new API key
 */
export interface CreateKeyRequest {
  label: string;
  key_type: "publishable" | "secret";
  rate_limit_rpm: number;
}

/**
 * Ephemeral token response
 */
export interface TokenResponse {
  ephemeral_token: string;
  expires_at: number;
  ttl_seconds: number;
  project_id: string;
}

/**
 * Request for minting an ephemeral token
 */
export interface CreateTokenRequest {
  ttl_seconds: number;
  metadata: Record<string, string>;
}

/**
 * Rotated token response
 */
export interface RotatedTokenResponse {
  ephemeral_token: string;
  expires_at: number;
  ttl_seconds: number;
  project_id: string;
  previous_remaining_ttl: number;
}

/**
 * Request for rotating a token
 */
export interface RotateTokenRequest {
  current_token: string;
  ttl_seconds: number;
}

/**
 * Create a new API key
 */
export async function createApiKey(
  projectId: string,
  data: CreateKeyRequest
): Promise<CreatedKeyResponse> {
  return apiFetch<CreatedKeyResponse>(`/projects/${projectId}/keys`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * List all API keys for a project
 */
export async function listApiKeys(projectId: string): Promise<ApiKeyResponse[]> {
  return apiFetch<ApiKeyResponse[]>(`/projects/${projectId}/keys`);
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(
  projectId: string,
  keyId: string
): Promise<void> {
  return apiFetch<void>(`/projects/${projectId}/keys/${keyId}`, {
    method: "DELETE",
  });
}

/**
 * Mint an ephemeral token using a secret key
 * Requires: Authorization: Bearer sk_live_...
 */
export async function mintEphemeralToken(
  secretKey: string,
  data: CreateTokenRequest
): Promise<TokenResponse> {
  const res = await fetch(`/api/tokens`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${secretKey}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? "Failed to mint token");
  }

  return res.json();
}

/**
 * Rotate an ephemeral token using a secret key
 * Requires: Authorization: Bearer sk_live_...
 */
export async function rotateEphemeralToken(
  secretKey: string,
  data: RotateTokenRequest
): Promise<RotatedTokenResponse> {
  const res = await fetch(`/api/tokens/rotate`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${secretKey}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? "Failed to rotate token");
  }

  return res.json();
}
