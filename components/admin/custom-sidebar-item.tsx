import { LucideIcon, HelpCircle } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

interface Props {
  href: string;
  title: string;
  label?: string;
  icon?: LucideIcon; // This is the component definition
}

export default function CustomSidebarItem({ icon: Icon, ...props }: Props) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <a href={props.href}>
          {Icon && <Icon className="size-4" />}
          <span>{props.title}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>    
  );
}