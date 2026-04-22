'use client'

import { ChartColumnIncreasing, ShieldCheck, Sparkles, Waves } from "lucide-react"

import PrimaryLink from "@/components/primary-link"
import SecondaryLink from "@/components/secondary-link"
import { TEXTS } from "@/lib/constants"
import Aurora from "../../components/user/decoration/Aurora"

export default function HomePage() {
  const highlights = [
    {
      title: "Operational visibility",
      description: "Track sessions, durations, token usage, and error rates without leaving the workspace.",
      icon: ChartColumnIncreasing,
    },
    {
      title: "Safer deployment flow",
      description: "Keep prompts, tool access, and voice settings aligned behind one tenant-aware control surface.",
      icon: ShieldCheck,
    },
    {
      title: "Voice-first polish",
      description: "Ship branded AI assistant experiences that feel deliberate on desktop and mobile.",
      icon: Waves,
    },
  ]

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] overflow-hidden rounded-[2rem]">
        <Aurora
          colorStops={["#022c22", "#10b981", "#99f6e4"]}
          amplitude={0.85}
          blend={0.45}
        />
      </div>

      <section className="brand-panel relative overflow-hidden px-6 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:items-end">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <Sparkles className="size-3.5" />
              Green-first assistant platform
            </span>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {TEXTS.APP_NAME}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                {TEXTS.APP_TAGLINE}
              </p>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Configure prompts, voice behavior, tools, tokens, and project-level controls from a calm workspace designed to stay readable in both light mode and dark mode.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <PrimaryLink title="Start Building" href="/auth/signup" />
              <SecondaryLink title="Explore Docs" href="/docs" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {highlights.map((item) => {
              const Icon = item.icon

              return (
                <div key={item.title} className="brand-subtle-panel p-4 sm:p-5">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-4 text-base font-semibold text-foreground">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["One product language", "A single emerald token system now drives public pages, auth screens, and the dashboard."],
          ["Responsive by default", "Layouts use centered containers, fluid grids, and stacked actions instead of fixed-width shells."],
          ["Reusable foundations", "Shared route shells and brand primitives reduce the need for page-specific color decisions."],
        ].map(([title, copy]) => (
          <div key={title} className="brand-panel p-5 sm:p-6">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
          </div>
        ))}
      </section>

      <section className="brand-panel flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Ready to unify the operator experience?</p>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Create a workspace, configure your first project, and ship a greener, cleaner customer-facing assistant flow.
          </p>
        </div>
        <PrimaryLink title="Create Workspace" href="/auth/signup" />
      </section>
    </div>
  )
}