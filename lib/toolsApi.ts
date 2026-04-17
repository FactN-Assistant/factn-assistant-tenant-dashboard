/**
 * lib/toolsApi.ts
 * ────────────────
 * API client for tools CRUD operations.
 * All endpoints are project-scoped and require authentication.
 *
 * Routes:
 *   GET    /v1/projects/{project_id}/tools
 *   POST   /v1/projects/{project_id}/tools
 *   PATCH  /v1/projects/{project_id}/tools/{tool_name}
 *   DELETE /v1/projects/{project_id}/tools/{tool_name}
 */

import { apiFetch, ApiError } from "./api";

/**
 * Backend ToolResponse shape (matches what the API returns)
 * Note: webhook_secret is never returned for security
 */
export interface ToolResponse {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execution_mode: "static" | "webhook";
  static_response?: Record<string, any> | null;
  webhook_url?: string | null;
  timeout_ms: number;
}

/**
 * Request shape for creating a tool
 */
export interface CreateToolRequest {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execution_mode?: "static" | "webhook";
  static_response?: Record<string, any>;
  webhook_url?: string;
  webhook_secret?: string;
  timeout_ms?: number;
}

/**
 * Request shape for updating a tool
 */
export interface UpdateToolRequest {
  name?: string;
  description?: string;
  parameters?: Record<string, any>;
  execution_mode?: "static" | "webhook";
  static_response?: Record<string, any>;
  webhook_url?: string;
  webhook_secret?: string;
  timeout_ms?: number;
}

/**
 * Fetch all tools for a project
 */
export async function fetchTools(projectId: string): Promise<ToolResponse[]> {
  return apiFetch<ToolResponse[]>(`/projects/${projectId}/tools`);
}

/**
 * Create a new tool in a project
 */
export async function createTool(
  projectId: string,
  data: CreateToolRequest
): Promise<ToolResponse> {
  return apiFetch<ToolResponse>(`/projects/${projectId}/tools`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing tool (identified by tool_name in URL)
 * All fields in the request body are optional (PATCH semantics)
 */
export async function updateTool(
  projectId: string,
  toolName: string,
  data: UpdateToolRequest
): Promise<ToolResponse> {
  return apiFetch<ToolResponse>(`/projects/${projectId}/tools/${toolName}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Delete a tool from a project
 * Returns no content (204)
 */
export async function deleteTool(
  projectId: string,
  toolName: string
): Promise<void> {
  return apiFetch<void>(`/projects/${projectId}/tools/${toolName}`, {
    method: "DELETE",
  });
}
