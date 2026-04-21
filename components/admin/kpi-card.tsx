import { Card, CardContent } from "../ui/card"
import { Skeleton } from "../ui/skeleton"

export default function KpiCard({
  icon,
  label,
  value,
  loading,
  variant = "default",
}: {
  icon: React.ReactNode
  label: string
  value?: string | number
  loading: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        {loading ? (
          <Skeleton className="h-7 w-20 mt-1" />
        ) : (
          <p
            className={`text-2xl font-semibold tabular-nums ${
              variant === "destructive" ? "text-destructive" : ""
            }`}
          >
            {value ?? "–"}
          </p>
        )}
      </CardContent>
    </Card>
  )
}