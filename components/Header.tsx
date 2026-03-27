import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";

export default function Header() {
  return (
    <header className="flex justify-start h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex flex-row items-center gap-2 px-4 justify-center">
        <SidebarTrigger className="-ml-1" />
      </div>
    </header>
  )
}