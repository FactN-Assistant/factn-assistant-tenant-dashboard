"use client"

import { useState, useEffect } from "react"
import { Plus, Wrench, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tool, ToolFormValues, ToolParameter } from "@/lib/types"
import { ToolResponse, createTool, deleteTool, fetchTools, updateTool } from "@/lib/toolsApi"
import ToolCard from "@/components/admin/tool-card"
import CreateToolModal from "./create-modal"
import EditToolModal from "./edit-modal"
import { useProject } from "@/hooks/useProject"

// ── Helper: Convert form parameters (array) to JSON Schema (object) ──
function parametersToJsonSchema(params: ToolParameter[]): Record<string, any> {
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

// ── Helper: Convert JSON Schema to form parameters (array) ──
function jsonSchemaToParameters(schema: Record<string, any>): ToolParameter[] {
  if (!schema || typeof schema !== "object" || !schema.properties) {
    return [];
  }

  const requiredFields = Array.isArray(schema.required) ? schema.required : [];

  return Object.entries(schema.properties).map(([name, propSchema]: [string, any]) => ({
    name,
    type: propSchema.type || "string",
    description: propSchema.description || "",
    required: requiredFields.includes(name),
  }));
}

export default function Tools() {
  const { selectedProject } = useProject()
  const [tools, setTools] = useState<ToolResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<ToolResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Fetch tools on project selection ──────────────────────
  useEffect(() => {
    if (!selectedProject?.project_id) {
      setTools([])
      return
    }

    const loadTools = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchTools(selectedProject.project_id)
        setTools(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load tools"
        setError(message)
        console.error("Error fetching tools:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadTools()
  }, [selectedProject?.project_id])

  // ── Handle create tool ────────────────────────────────────
  const handleCreate = async (data: ToolFormValues) => {
    if (!selectedProject?.project_id) {
      setError("No project selected")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      // Parse static_response and webhook_url as JSON if needed
      let staticResponse: Record<string, any> | undefined = undefined;
      if (data.execution_mode === "static" && data.static_response) {
        try {
          staticResponse = JSON.parse(data.static_response);
        } catch (e) {
          setError("Invalid JSON in static response");
          setIsSubmitting(false);
          return;
        }
      }

      // Convert form parameters to JSON Schema
      const jsonSchemaParams = parametersToJsonSchema(data.parameters);

      // Convert form values to API request format
      const createRequest = {
        name: data.name,
        description: data.description,
        execution_mode: data.execution_mode,
        parameters: jsonSchemaParams,
        ...(data.execution_mode === "static" && staticResponse && { static_response: staticResponse }),
        ...(data.execution_mode === "webhook" && data.webhook_url && { webhook_url: data.webhook_url }),
        ...(data.webhook_secret && { webhook_secret: data.webhook_secret }),
        timeout_ms: data.timeout_ms,
      }

      const newTool = await createTool(selectedProject.project_id, createRequest)
      setTools((prev) => [...prev, newTool])
      setCreateModalOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create tool"
      setError(message)
      console.error("Error creating tool:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Handle edit tool ──────────────────────────────────────
  const handleEdit = async (data: ToolFormValues) => {
    if (!selectedProject?.project_id || !selectedTool) return

    setIsSubmitting(true)
    setError(null)
    try {
      // Parse static_response if needed
      let staticResponse: Record<string, any> | undefined = undefined;
      if (data.execution_mode === "static" && data.static_response) {
        try {
          staticResponse = JSON.parse(data.static_response);
        } catch (e) {
          setError("Invalid JSON in static response");
          setIsSubmitting(false);
          return;
        }
      }

      // Convert form parameters to JSON Schema
      const jsonSchemaParams = parametersToJsonSchema(data.parameters);

      const updateRequest = {
        description: data.description,
        execution_mode: data.execution_mode,
        parameters: jsonSchemaParams,
        ...(data.execution_mode === "static" && staticResponse && { static_response: staticResponse }),
        ...(data.execution_mode === "webhook" && data.webhook_url && { webhook_url: data.webhook_url }),
        ...(data.webhook_secret && { webhook_secret: data.webhook_secret }),
        timeout_ms: data.timeout_ms,
      }

      const updatedTool = await updateTool(selectedProject.project_id, selectedTool.name, updateRequest)
      setTools((prev) =>
        prev.map((t) => (t.name === selectedTool.name ? updatedTool : t))
      )
      setEditModalOpen(false)
      setSelectedTool(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update tool"
      setError(message)
      console.error("Error updating tool:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Handle delete tool ────────────────────────────────────
  const handleDelete = async (tool: ToolResponse) => {
    if (!selectedProject?.project_id) {
      setError("No project selected")
      return
    }

    if (!window.confirm(`Are you sure you want to delete the tool "${tool.name}"?`)) {
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await deleteTool(selectedProject.project_id, tool.name)
      setTools((prev) => prev.filter((t) => t.name !== tool.name))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete tool"
      setError(message)
      console.error("Error deleting tool:", err)
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="m-10">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            Tools
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tools.length} tool{tools.length !== 1 ? "s" : ""} defined for this project
          </p>
        </div>
        <Button 
          onClick={() => setCreateModalOpen(true)} 
          className="gap-1.5 py-5 px-3 rounded-full"
          disabled={!selectedProject || isSubmitting}
        >
          <Plus />
          New tool
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <div className="text-sm text-muted-foreground">Loading tools...</div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && tools.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Wrench className="h-8 w-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No tools defined yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Add a tool to let Gemini call your functions.</p>
          <Button 
            onClick={() => setCreateModalOpen(true)} 
            variant="outline" 
            size="sm" 
            className="mt-4 gap-1.5"
            disabled={!selectedProject || isSubmitting}
          >
            <Plus className="h-3.5 w-3.5" /> Add your first tool
          </Button>
        </div>
      )}

      {/* Tool list */}
      {!isLoading && tools.length > 0 && (
        <div className="space-y-2">
          {tools.map((tool) => (
            <ToolCard
              key={tool.name}
              tool={tool}
              onEdit={() => {
                setSelectedTool(tool)
                setEditModalOpen(true)
              }}
              onDelete={() => handleDelete(tool)}
              isDeleting={isSubmitting}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      <CreateToolModal 
        isOpen={isCreateModalOpen} 
        onOpenChange={() => setCreateModalOpen(false)} 
        onSave={handleCreate}
        isSubmitting={isSubmitting}
      />

      {/* Edit modal */}
      <EditToolModal 
        isOpen={isEditModalOpen} 
        selectedTool={selectedTool}
        onOpenChange={() => setEditModalOpen(false)} 
        onSave={handleEdit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}