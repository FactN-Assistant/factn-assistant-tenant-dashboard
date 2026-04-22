'use client'

import Link from "next/link"

import BrandMark from "@/components/brand/brand-mark"
import { useAuth } from "@/hooks/useAuth"
import PrimaryLink from "../primary-link"
import SecondaryLink from "../secondary-link"

export default function HomeHeader() {
  const { user, isLoading } = useAuth()

  const navItems = [
    { href: "/docs", label: "Docs" },
    { href: "/about", label: "About" },
    { href: "/pricing", label: "Pricing" },
  ]

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-3 sm:px-6">
      <div className="brand-panel mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <Link href="/" className="min-w-0">
          <BrandMark compact className="transition-transform duration-200 hover:scale-[1.01]" />
        </Link>

        <nav className="order-3 flex w-full flex-wrap items-center justify-center gap-2 rounded-full border border-border/60 bg-background/45 px-3 py-2 text-sm backdrop-blur-md sm:order-2 sm:w-auto sm:gap-5 sm:border-transparent sm:bg-transparent sm:px-0 sm:py-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-primary"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="order-2 flex flex-wrap items-center justify-end gap-2 sm:order-3">
          {!isLoading && user ? (
            <PrimaryLink title="Dashboard" href="/dashboard" />
          ) : (
            <>
              <SecondaryLink title="Login" href="/auth/login" />
              <PrimaryLink title="Register" href="/auth/signup" />
            </>
          )}
        </div>
      </div>
    </header>
  )
}