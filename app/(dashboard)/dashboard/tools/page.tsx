"use client"

import { useState } from "react"
import { Plus, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tool, ToolFormValues } from "@/lib/types"
import { MOCK_TOOLS } from "@/lib/mock-data"
import ToolCard from "@/components/admin/tool-card"
import CreateToolModal from "./create-modal"
import EditToolModal from "./edit-modal"

export default function Tools() {
  const [tools, setTools] = useState<Tool[]>(MOCK_TOOLS)
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool|null>(null)

  const handleCreate = (data: ToolFormValues) => {
    console.log("Tool data:", data)
    const newTool: Tool = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      execution_mode: data.execution_mode,
      parameters: data.parameters,
      static_response: data.static_response || undefined,
      webhook_url: data.webhook_url || undefined,
      webhook_secret: data.webhook_secret || undefined,
      timeout_ms: data.timeout_ms,
    }
    setTools((prev) => [...prev, newTool])
    setCreateModalOpen(false)
  }

  const handleEdit = (data: ToolFormValues) => {
    if (!selectedTool) return
    console.log("Edit tool:", selectedTool.id, data)

    setTools((prev) => 
      prev.map((t) => t.id === selectedTool.id ? { ...t, ...data } : t)
    );

    setEditModalOpen(false);
    setSelectedTool(null);
  }

  function handleDelete(tool: Tool) {
    console.log("Tool Id:", tool)
  }

  return (
    <div className="m-10">
      
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
        <Button onClick={() => setCreateModalOpen(true)} className="gap-1.5 py-5 px-3 rounded-full">
          <Plus />
          New tool
        </Button>
      </div>

      {/* Tool list */}
      {tools.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Wrench className="h-8 w-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No tools defined yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Add a tool to let Gemini call your functions.</p>
          <Button onClick={() => setCreateModalOpen(true)} variant="outline" size="sm" className="mt-4 gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add your first tool
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onEdit={() => {
                setSelectedTool(tool);
                setEditModalOpen(true);
              }}
              onDelete={() => handleDelete(tool)}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      <CreateToolModal 
        isOpen={isCreateModalOpen} 
        onOpenChange={() => setCreateModalOpen(false)} 
        onSave={handleCreate} 
      />

      {/* Edit modal */}
      <EditToolModal 
        isOpen={isEditModalOpen} 
        selectedTool={selectedTool}
        onOpenChange={() => setEditModalOpen(false)} 
        onSave={handleEdit}
      />
    </div>
  )
}