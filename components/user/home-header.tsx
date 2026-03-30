import { AudioLines } from "lucide-react";

export default function HomeHeader() {
  return (
    // Added w-full, z-50, and relative or fixed positioning
    // Also added px-4 so the items aren't touching the screen edges
    <header className="fixed top-0 left-0 w-full z-50 flex flex-row border-b h-12 items-center justify-between px-6 bg-black/30 backdrop-blur-sm">
      <div className="flex items-center">
        <AudioLines />
      </div>
      <nav>
        <p className="cursor-pointer hover:text-red-500 transition-colors">
          Docs
        </p>
      </nav>
      
    </header>
  )
}