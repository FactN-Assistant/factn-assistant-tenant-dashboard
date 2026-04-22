import { AudioLines } from "lucide-react"

import { cn } from "@/lib/utils"
import { TEXTS } from "@/lib/constants"

interface BrandMarkProps {
  className?: string
  compact?: boolean
  subtitle?: string
}

export default function BrandMark({
  className,
  compact = false,
  subtitle = "AI orchestration for voice-first teams",
}: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary text-primary-foreground shadow-[0_18px_40px_-20px_color-mix(in_oklab,var(--primary)_75%,transparent)]">
        <AudioLines className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-[0.18em] text-foreground/90 uppercase">
          {TEXTS.APP_NAME}
        </p>
        {!compact ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}