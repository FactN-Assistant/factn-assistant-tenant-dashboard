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
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background pr-3">
      <div className="flex h-(--header-height) w-full items-center justify-start gap-2">
        <div className="flex flex-row h-full items-center justify-center px-2 gap-2">
          <Button
            className="h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon />
          </Button>
          <Separator orientation="vertical" className="mr-2 h-full" />
        </div>
        <div className="flex flex-row gap-2 items-center justify-center">
          <LoggedUser/>
          <p>/</p>
          <ProjectSelector />
          <Button onClick={() => setShowCreateModal(true)}>
            Create a new project
          </Button>
        </div>
      </div>
      <Logout />

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
