import { AudioLines } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import PrimaryLink from "../primary-link";
import SecondaryLink from "../secondary-link";

export default function HomeHeader() {
  return (
    <header className="fixed top-4 rounded-full shadow w-7xl mx-auto z-50 flex flex-row border-b h-16 items-center justify-between px-3 bg-black/30 backdrop-blur-lg">
      <Link href="/">
        <div className="flex items-center border p-2 rounded-full hover:bg-black/20 transition-all duration-300 ease-in-out">
          <AudioLines />
        </div>
      </Link>
      <nav className="flex flex-row gap-7 items-center justify-center">
        <Link className="cursor-pointer hover:text-green-500 transition-colors" href={"docs"}>
          Docs
        </Link>
        <Link className="cursor-pointer hover:text-green-500 transition-colors" href={"about"}>
          About
        </Link>
        <Link className="cursor-pointer hover:text-green-500 transition-colors" href={"pricing"}>
          Pricing
        </Link>
        <div className="flex flex-row gap-3">
          <SecondaryLink title={"Login"} href={"/auth/login"} />
          <PrimaryLink title={"Register"} href={"/auth/signup"} />
        </div>
      </nav>
      
    </header>
  )
}