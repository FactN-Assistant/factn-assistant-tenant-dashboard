/**
 * hooks/useTools.ts
 * ------------------
 * Hook that manages all tool CRUD operations using TanStack Query.
 *
 * Provides:
 *   - tools list query (auto-fetches when projectId is available)
 *   - createTool mutation
 *   - updateTool mutation
 *   - deleteTool mutation
 *
 * All mutations auto-invalidate the tools list query on success
 * and show toast notifications via react-hot-toast.
 *
 * Follows the same pattern as useAuth.ts.
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  toolResponseSchema,
  type ToolResponse,
  type ToolParameter,
  type CreateToolPayload,
  type UpdateToolPayload,
} from "@/lib/schemas/tool-schemas";
import { useFetch } from "./useFetch";

export type { ToolResponse, ToolParameter, CreateToolPayload, UpdateToolPayload };

const TOOLS_QUERY_KEY = "tools";

// ── Helper: Convert form parameters (array) → JSON Schema (object) ──

function parametersToJsonSchema(
  params: ToolParameter[]
): Record<string, any> {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  params.forEach((param) => {
    properties[param.name] = {
      type: param.type,
      description: param.description,
    };
    if (param.required) {
      required.push(param.name);
    }
  });

  return {
    type: "object",
    properties,
    ...(required.length > 0 && { required }),
  };
}

// ── Helper: Convert JSON Schema (object) → form parameters (array) ──

export function jsonSchemaToParameters(
  schema: Record<string, any>
): ToolParameter[] {
  if (!schema || typeof schema !== "object" || !schema.properties) {
    return [];
  }

  const requiredFields = Array.isArray(schema.required)
    ? schema.required
    : [];

  return Object.entries(schema.properties).map(
    ([name, propSchema]: [string, any]) => ({
      name,
      type: propSchema.type || "string",
      description: propSchema.description || "",
      required: requiredFields.includes(name),
    })
  );
}

// ── Request body builders ────────────────────────────────────

function buildCreateBody(data: CreateToolPayload): Record<string, any> {
  const jsonSchemaParams = parametersToJsonSchema(data.parameters);

  let staticResponse: Record<string, any> | undefined;
  if (data.execution_mode === "static" && data.static_response) {
    staticResponse = JSON.parse(data.static_response);
  }

  return {
    name: data.name,
    description: data.description,
    execution_mode: data.execution_mode,
    parameters: jsonSchemaParams,
    ...(data.execution_mode === "static" &&
      staticResponse && { static_response: staticResponse }),
    ...(data.execution_mode === "webhook" &&
      data.webhook_url && { webhook_url: data.webhook_url }),
    ...(data.webhook_secret && { webhook_secret: data.webhook_secret }),
    timeout_ms: data.timeout_ms,
  };
}

function buildUpdateBody(data: UpdateToolPayload): Record<string, any> {
  const body: Record<string, any> = {};

  if (data.description !== undefined) body.description = data.description;
  if (data.execution_mode !== undefined)
    body.execution_mode = data.execution_mode;
  if (data.parameters !== undefined)
    body.parameters = parametersToJsonSchema(data.parameters);
  if (data.timeout_ms !== undefined) body.timeout_ms = data.timeout_ms;

  if (data.execution_mode === "static" && data.static_response) {
    body.static_response = JSON.parse(data.static_response);
  }
  if (data.execution_mode === "webhook" && data.webhook_url) {
    body.webhook_url = data.webhook_url;
  }
  if (data.webhook_secret) {
    body.webhook_secret = data.webhook_secret;
  }

  return body;
}

/**
 * Custom hook that manages all tool operations via TanStack Query.
 *
 * @param projectId - The project to scope tool operations to.
 *                    Pass empty string if no project is selected yet.
 */
export function useTools(projectId: string) {
  const queryClient = useQueryClient();
  const fetchWithRefresh = useFetch();

  const toolsQueryKey = [TOOLS_QUERY_KEY, projectId];

  // ── Fetch tools list ───────────────────────────────────────

  const {
    data: tools = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: toolsQueryKey,
    queryFn: async (): Promise<ToolResponse[]> => {
      const data = await fetchWithRefresh<unknown[]>(`/projects/${projectId}/tools`);
      return z.array(toolResponseSchema).parse(data);
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });

  // ── Create tool mutation ───────────────────────────────────

  const createToolMutation = useMutation({
    mutationFn: async (payload: CreateToolPayload): Promise<ToolResponse> => {
      const body = buildCreateBody(payload);
      const data = await fetchWithRefresh<unknown>(`/projects/${projectId}/tools`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      return toolResponseSchema.parse(data);
    },
    onSuccess: (newTool) => {
      queryClient.invalidateQueries({ queryKey: toolsQueryKey });
      toast.success(`Tool "${newTool.name}" created`);
    },
    onError: (err: Error) => {
      console.log("err: ", err)
      toast.error(err.message);
    },
  });

  // ── Update tool mutation ───────────────────────────────────

  const updateToolMutation = useMutation({
    mutationFn: async (payload: UpdateToolPayload): Promise<ToolResponse> => {
      const body = buildUpdateBody(payload);
      const data = await fetchWithRefresh<unknown>(
        `/projects/${projectId}/tools/${payload.toolName}`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
        }
      );
      return toolResponseSchema.parse(data);
    },
    onSuccess: (updatedTool) => {
      queryClient.invalidateQueries({ queryKey: toolsQueryKey });
      toast.success(`Tool "${updatedTool.name}" updated`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // ── Delete tool mutation ───────────────────────────────────

  const deleteToolMutation = useMutation({
    mutationFn: async (toolName: string): Promise<void> => {
      await fetchWithRefresh<void>(
        `/projects/${projectId}/tools/${toolName}`,
        { method: "DELETE" }
      );
    },
    onSuccess: (_data, toolName) => {
      queryClient.invalidateQueries({ queryKey: toolsQueryKey });
      toast.success(`Tool "${toolName}" deleted`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const error = queryError ? queryError.message : null;

  return {
    tools,
    isLoading,
    error,
    createToolMutation,
    updateToolMutation,
    deleteToolMutation,
    jsonSchemaToParameters,
  };
}