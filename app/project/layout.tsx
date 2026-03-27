import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const params = useParams();
  // const projectId = params?.projectId as string;
 
  return (
    <div className="flex flex-col flex-1 h-screen text-white font-sans overflow-hidden">
      <SidebarProvider >
        <TooltipProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <main className="flex-1 flex-row overflow-auto">
            {children}
          </main>
          </ThemeProvider>
        </SidebarInset>
        </TooltipProvider>
      </SidebarProvider>
    </div>
  );
}