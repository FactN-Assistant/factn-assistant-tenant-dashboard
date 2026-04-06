"use client"

import * as React from "react"
import {
  AudioLines,
  BookOpen,
  ChartArea,
  Frame,
  Hammer,
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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  general: [
    {
      title: "Project Stats",
      url: "/dashboard/stats",
      icon: ChartArea,
    },
    {
      title: "Playground",
      url: "/dashboard/playground",
      icon: Play,
    },
  ],
  navMain: [
    {
      title: "System Prompt",
      url: "/dashboard/prompt",
      icon: MonitorCog,
    },
    {
      title: "Tools",
      url: "/dashboard/tools",
      icon: Wrench,
    },
    {
      title: "Voice Config",
      url: "/dashboard/voice_config",
      icon: MicVocal,
    },
  ],
  navSecondary: [
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
  ],

  projects: [
    {
      name: "Design Engineering",
      url: "/dashboard/system_prompt",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
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
        

        <NavMain items={data.general} label="General" />
        <NavMain items={data.navMain} label="Project Configs" />
        {/* <NavProjects projects={data.projects} /> */}
        
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={data.navSecondary} />
      </SidebarFooter>
    </Sidebar>
  )
}
