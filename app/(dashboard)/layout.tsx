import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../app/globals.css";
import AdminHeader from "@/components/admin/admin-header";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/admin/app-sidebar";

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
      <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        
        <main className="w-full">
        <AdminHeader />
          {children}
        </main>

        {/* <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
        </header> */}

      </SidebarInset>
    </SidebarProvider>
    </>
  )
}