"use client"

import { useState } from "react"
import { Plus, Wrench, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ToolFormValues } from "@/lib/schemas/tool-schemas"
import { useTools, type ToolResponse } from "@/hooks/useTools"
import ToolCard from "@/components/admin/tool-card"
import CreateToolModal from "./create-modal"
import { useProject } from "@/hooks/useProject"
import EditToolModal from "./edit-modal"

export default function Tools() {
  const { selectedProject } = useProject()
  const projectId = selectedProject?.project_id ?? ""
  const { tools, isLoading, error, createToolMutation, updateToolMutation, deleteToolMutation } = useTools(projectId)

  const [isCreateModalOpen, setCreateModalOpen] = useState(false)
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<ToolResponse | null>(null)

  const isSubmitting = createToolMutation.isPending || updateToolMutation.isPending || deleteToolMutation.isPending

  // ── Handle create tool ────────────────────────────────────
  const handleCreate = (data: ToolFormValues) => {
    createToolMutation.mutate(data, {
      onSuccess: () => setCreateModalOpen(false),
    })
  }

  // ── Handle edit tool ──────────────────────────────────────
  const handleEdit = (data: ToolFormValues) => {
    if (!selectedTool) return

    updateToolMutation.mutate(
      { toolName: selectedTool.name, ...data },
      {
        onSuccess: () => {
          setEditModalOpen(false)
          setSelectedTool(null)
        },
      }
    )
  }

  // ── Handle delete tool ────────────────────────────────────
  const handleDelete = (tool: ToolResponse) => {
    if (!window.confirm(`Are you sure you want to delete the tool "${tool.name}"?`)) {
      return
    }
    deleteToolMutation.mutate(tool.name)
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
          className="gap-1.5 py-5 px-3"
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
