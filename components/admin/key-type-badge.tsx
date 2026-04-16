import { Globe, Server } from "lucide-react";
import { Badge } from "../ui/badge";

export default function KeyTypeBadge({ type }: { type: "publishable" | "secret" }) {
  return type === "publishable" ? (
    <Badge variant="secondary" className="gap-1 text-[10px] px-1.5 py-0">
      <Globe className="h-2.5 w-2.5" /> publishable
    </Badge>
  ) : (
    <Badge className="gap-1 text-[10px] px-1.5 py-0 bg-amber-100 text-amber-800 border-0 dark:bg-amber-900/30 dark:text-amber-300">
      <Server className="h-2.5 w-2.5" /> secret
    </Badge>
  )
}
