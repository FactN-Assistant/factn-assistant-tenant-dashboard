"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import {
  BookOpen,
  ChartArea,
  FileText,
  KeyRound,
  LifeBuoy,
  MicVocal,
  MonitorCog,
  Play,
  Send,
  Settings,
  Wrench,
} from "lucide-react"

import BrandMark from "@/components/brand/brand-mark"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import CustomSidebarItem from "./custom-sidebar-item"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const params = useParams()
  const projectId = typeof params?.projectId === "string" ? params.projectId : ""

  // Build navigation items with the current project ID
  const general = [
    {
      title: "Project Stats",
      url: `/${projectId}/stats`,
      icon: ChartArea,
    },
    {
      title: "Playground",
      url: `/${projectId}/playground`,
      icon: Play,
    },
  ]

  const navMain = [
    {
      title: "Project Info",
      url: `/${projectId}/info`,
      icon: FileText,
    },
    {
      title: "System Prompt",
      url: `/${projectId}/prompt`,
      icon: MonitorCog,
    },
    {
      title: "Tools",
      url: `/${projectId}/tools`,
      icon: Wrench,
    },
    {
      title: "Voice Config",
      url: `/${projectId}/voice-config`,
      icon: MicVocal,
    },
    {
      title: "API Keys",
      url: `/${projectId}/keys`,
      icon: KeyRound,
    },
  ]

  const navSecondary = [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ]
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! px-3 pb-3"
      {...props}
    >
      <SidebarHeader>
        <div className="brand-subtle-panel px-3 py-3">
          <BrandMark compact={false} subtitle="Command center for multi-tenant AI delivery" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="brand-subtle-panel p-2">
          <SidebarMenu>
            <CustomSidebarItem href={"/dashboard/getstarted"} title={"Get Started"} icon={BookOpen} />
          </SidebarMenu>
        </div>
        

        <NavMain items={general} label="General" />
        <NavMain items={navMain} label="Project Configs" />
        
      </SidebarContent>
      <SidebarFooter>
        <div className="brand-subtle-panel p-2">
          <NavSecondary items={navSecondary} />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
