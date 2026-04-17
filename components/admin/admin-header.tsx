"use client"

import { SidebarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import Logout from "../logout-button"
import LoggedUser from "./loggedin-user"
import ProjectSelector from "./project-selector-header"

export function AdminHeader() {
  const { toggleSidebar } = useSidebar()

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
        </div>
      </div>
      <Logout />
    </header>
  )
}
