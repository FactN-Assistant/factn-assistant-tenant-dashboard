import { Layers3, ShieldEllipsis, Workflow } from "lucide-react"

import PublicPageShell from "@/components/brand/public-page-shell"

export default function About() {
  return (
    <PublicPageShell
      eyebrow="About"
      title="FACTn Assistant is built to make AI operations feel like product design, not damage control."
      description="The platform brings prompt management, tooling, tokens, and voice configuration into one coherent tenant dashboard so teams can operate confidently as they ship customer-facing assistants."
      aside={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">What this redesign emphasizes</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Calm surfaces, stronger information hierarchy, and one consistent brand language across public pages, onboarding, auth, and the dashboard.
          </p>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          [Layers3, "Unified control plane", "Project settings, prompts, tools, and metrics live inside one visual system instead of separate admin islands."],
          [Workflow, "Operational flow", "Teams can move from onboarding to project setup to monitoring without relearning the interface on each route."],
          [ShieldEllipsis, "Trustworthy surfaces", "Contrast, spacing, and responsive behavior were tuned for both dark and light themes from the start."],
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