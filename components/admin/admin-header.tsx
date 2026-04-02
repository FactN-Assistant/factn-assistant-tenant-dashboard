import { SidebarTrigger } from "../ui/sidebar";

export default function AdminHeader() {
  return (
    <div className="border-b w-full h-12 flex flex-row items-center justify-start pl-2">
      <SidebarTrigger className="-ml-1" />
    </div>
  )
}