import { BadgeCheck, Building2, Rocket } from "lucide-react"

import PublicPageShell from "@/components/brand/public-page-shell"

export default function Pricing() {
  return (
    <PublicPageShell
      eyebrow="Pricing"
      title="A pricing page should feel trustworthy before it feels persuasive."
      description="This frame sets up clear plan storytelling, comparison tables, and conversion actions without breaking the visual language of the rest of the site."
      aside={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Structure</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Three distinct plan tiers with a highlighted primary option fit naturally into this shell.
          </p>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          [BadgeCheck, "Starter", "A lightweight plan for early teams that need the branded workspace and core assistant controls."],
          [Rocket, "Pro", "Higher limits, richer monitoring, and more configuration headroom for production usage."],
          [Building2, "Enterprise", "Custom governance, operational support, and deployment guidance for larger organizations."],
        ].map(([Icon, title, copy]) => (
          <div key={title} className="brand-panel p-5 sm:p-6">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <Icon className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
          </div>
        ))}
      </div>
    </PublicPageShell>
  )
}