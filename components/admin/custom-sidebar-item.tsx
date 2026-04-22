import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

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
        <Link href={props.href}>
          {Icon && <Icon className="size-4" />}
          <span>{props.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>    
  );
}