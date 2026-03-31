import { AudioLines } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

export default function HomeHeader() {
  return (
    // Added w-full, z-50, and relative or fixed positioning
    // Also added px-4 so the items aren't touching the screen edges
    <header className="fixed top-0 left-0 w-full z-50 flex flex-row border-b h-12 items-center justify-between px-6 bg-black/30 backdrop-blur-sm">
      <a href="/">
        <div className="flex items-center">
          <AudioLines />
        </div>
      </a>
      <nav className="flex flex-row gap-5 items-center justify-center">
        <Link className="cursor-pointer hover:text-green-500 transition-colors" href={"docs"}>
          Docs
        </Link>
        <Link className="cursor-pointer hover:text-green-500 transition-colors" href={"about"}>
          About
        </Link>
        <Link className="cursor-pointer hover:text-green-500 transition-colors" href={"pricing"}>
          Pricing
        </Link>
        <Link className={cn(buttonVariants({ variant: "default" }), "bg-green-600 hover:bg-green-700 text-white border-none")} href="dashboard">
          Dashboard
        </Link>

      </nav>
      
    </header>
  )
}