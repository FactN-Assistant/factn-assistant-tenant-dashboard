"use client"

import { useState } from "react"
import { SidebarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { useProject } from "@/hooks/useProject"
import Logout from "../logout-button"
import LoggedUser from "./loggedin-user"
import ProjectSelector from "./project-selector-header"
import CreateProjectModal from "./create-project-modal"

export function AdminHeader() {
  const { toggleSidebar } = useSidebar()
  const { createProjectMutation } = useProject()
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <header className="sticky top-0 z-50 px-3 py-3 sm:px-4">
      <div className="brand-panel flex min-h-(--header-height) w-full flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            className="h-9 w-9 rounded-full"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon />
          </Button>
          <Separator orientation="vertical" className="hidden h-8 sm:block" />
          <div className="hidden min-w-0 sm:block">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Workspace</p>
            <p className="truncate text-sm text-muted-foreground">Project controls and live operational metrics</p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-2 lg:w-auto">
          <LoggedUser />
          <ProjectSelector />
          <Button onClick={() => setShowCreateModal(true)} className="rounded-full px-4">
            Create a new project
          </Button>
          <Logout />
        </div>
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onOpenChange={() => setShowCreateModal(false)}
        onSave={(data) => {
          createProjectMutation.mutate(data, {
            onSuccess: () => setShowCreateModal(false),
          })
        }}
        isSubmitting={createProjectMutation.isPending}
      />
    </header>
  )
}
