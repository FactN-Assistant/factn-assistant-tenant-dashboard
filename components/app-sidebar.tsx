"use client"

import * as React from "react"
import {
  AudioLines,
  KeyRound,
  MonitorCog,
  SquareFunction,
} from "lucide-react"

import { DocumentationButton } from "./DocumentationButton"
import { ProductLogo } from "./product-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "System Prompt",        
    url: "#", 
    icon: MonitorCog    
  },
  { title: "Function Calls",       
    url: "#", 
    icon: SquareFunction 
  },
  { title: "Voice Configurations", 
    url: "#", 
    icon: AudioLines     
  },
  { title: "API Keys",             
    url: "#", 
    icon: KeyRound       
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ProductLogo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main nav</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <DocumentationButton />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}