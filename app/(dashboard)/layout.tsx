import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../app/globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "FACTn Assisntant",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
    <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className="flex flex-col">
        <TooltipProvider delayDuration={0}>
          <AdminHeader />

          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <main className="w-full">
                {children}
              </main>
            </SidebarInset>
          </div>
        </TooltipProvider>
      </SidebarProvider>
    </div>
    </>
  )
}