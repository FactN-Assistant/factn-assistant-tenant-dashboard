import { Badge } from "../ui/badge"

export default function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "error"
      ? "destructive"
      : status === "timeout"
        ? "secondary"
        : "outline"

  return (
    <Badge variant={variant as "destructive" | "secondary" | "outline"} className="capitalize text-xs">
      {status}
    </Badge>
  )
}