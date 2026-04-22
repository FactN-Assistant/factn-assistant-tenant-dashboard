interface PublicPageShellProps {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
  aside?: React.ReactNode
}

export default function PublicPageShell({
  eyebrow,
  title,
  description,
  children,
  aside,
}: PublicPageShellProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
        <div className="space-y-4">
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {eyebrow}
          </span>
          <h1 className="brand-title max-w-3xl">{title}</h1>
          <p className="brand-copy">{description}</p>
        </div>
        {aside ? <div className="brand-panel p-5 sm:p-6">{aside}</div> : null}
      </div>

      <div className="grid gap-4 md:gap-5">{children}</div>
    </section>
  )
}