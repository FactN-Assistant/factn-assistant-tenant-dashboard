import { BookOpenText, Cable, MicVocal } from "lucide-react"

import PublicPageShell from "@/components/brand/public-page-shell"

export default function Docs() {
  return (
    <PublicPageShell
      eyebrow="Docs"
      title="Documentation should feel like the product, not a fallback screen."
      description="This area now uses the same page frame as the rest of the public site, making it ready for richer docs content without introducing another visual pattern."
      aside={
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Recommended next doc sections:</p>
          <p>Authentication, project setup, prompt configuration, tools, and voice deployment.</p>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          [BookOpenText, "Getting started", "Guide new tenants through setup, project creation, and environment preparation with one clear flow."],
          [Cable, "API and integrations", "Document token usage, project endpoints, and how the dashboard connects to backend services."],
          [MicVocal, "Voice configuration", "Explain voice selection, behavior tuning, and validation rules in a space that matches the product UI."],
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