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
    <Card className="border border-border/70 bg-card/80 shadow-[0_18px_50px_-32px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <CardContent className="pt-4">
        <div className="mb-3 flex items-center gap-3 text-muted-foreground">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.16em]">{label}</span>
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