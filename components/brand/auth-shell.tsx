import Link from "next/link"

import BrandMark from "@/components/brand/brand-mark"

interface AuthShellProps {
  children: React.ReactNode
  visual: React.ReactNode
  kicker?: string
  blurb?: string
}

export default function AuthShell({
  children,
  visual,
  kicker = "Secure workspace access",
  blurb = "Manage projects, prompts, tooling, and voice flows from a single tenant-aware workspace.",
}: AuthShellProps) {
  return (
    <div className="brand-shell flex min-h-screen items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:gap-10">
        <section className="brand-panel order-2 flex min-h-145 flex-col p-5 sm:p-8 lg:order-1">
          <Link href="/" className="w-fit">
            <BrandMark className="transition-transform duration-200 hover:scale-[1.01]" />
          </Link>

          <div className="mt-8 flex flex-1 flex-col justify-center gap-8 sm:mt-10">
            <div className="space-y-4">
              <span className="inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                {kicker}
              </span>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                {blurb}
              </p>
            </div>

            <div className="brand-subtle-panel w-full p-4 sm:p-5">{children}</div>
          </div>
        </section>

        <aside className="brand-panel order-1 hidden min-h-145 overflow-hidden lg:order-2 lg:block">
          <div className="relative flex h-full flex-col justify-between p-8 xl:p-10">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary backdrop-blur-sm">
                Purpose-built for deployment teams
              </span>
              <h2 className="max-w-lg text-3xl font-semibold tracking-tight text-foreground xl:text-4xl">
                Build a calmer AI operations surface for your customers and your team.
              </h2>
            </div>

            <div className="absolute inset-0 opacity-90">{visual}</div>

            <div className="relative mt-auto grid gap-3 sm:grid-cols-2">
              <div className="brand-subtle-panel p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-primary">Operational clarity</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Realtime metrics, token visibility, and session traces in one consistent interface.
                </p>
              </div>
              <div className="brand-subtle-panel p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-primary">Brand-aligned experiences</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Light and dark surfaces tuned to the same emerald brand system.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}