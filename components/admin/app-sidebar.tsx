"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import {
  AudioLines,
  BookOpen,
  ChartArea,
  FileText,
  Frame,
  Hammer,
  KeyRound,
  LifeBuoy,
  Map,
  MicVocal,
  MonitorCog,
  PieChart,
  Play,
  Send,
  Settings,
  Waves,
  Wrench,
} from "lucide-react"


import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavSecondary } from "./nav-secondary"
import { ProjectSelector } from "./nav-user"
import { TEXTS } from "@/lib/constants"
import { Separator } from "@/components/ui/separator"
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
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex size-6 items-center justify-center rounded-md bg-emerald-500 text-primary-foreground">
                  <AudioLines className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium"> {TEXTS.APP_NAME} </span>
                  <span className="truncate text-xs">Chat-bot as a Service</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* <Separator />
        <SidebarMenu>
          <ProjectSelector user={data.user} />
        </SidebarMenu>
        <Separator /> */}

      </SidebarHeader>
      <SidebarContent>

        <CustomSidebarItem href={"/dashboard/getstarted"} title={"Get Started"} icon={BookOpen} />
        

        <NavMain items={general} label="General" />
        <NavMain items={navMain} label="Project Configs" />
        {/* <NavProjects projects={data.projects} /> */}
        
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={navSecondary} />
      </SidebarFooter>
    </Sidebar>
  )
}
