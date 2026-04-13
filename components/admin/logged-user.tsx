"use client";

import { useAuthStore } from "@/lib/useAuthStore";

/**
 * Plan badge colors — matches your backend's plan tiers.
 * free → gray, starter → blue, pro → purple, enterprise → amber
 */
const PLAN_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  free:       { bg: "bg-neutral-700",  text: "text-neutral-300", label: "Free"       },
  starter:    { bg: "bg-blue-900",     text: "text-blue-300",    label: "Starter"    },
  pro:        { bg: "bg-purple-900",   text: "text-purple-300",  label: "Pro"        },
  enterprise: { bg: "bg-amber-900",    text: "text-amber-300",   label: "Enterprise" },
};

/**
 * LoggedUser
 * ----------
 * Reads auth state from the Zustand store — no prop drilling needed.
 * The store is populated by useAuth()'s hydration effect in AuthProvider.
 *
 * Shows:
 *   - User's name  (from tenant profile)
 *   - Plan badge   (free / starter / pro / enterprise)
 *
 * During hydration (isLoading = true) shows a skeleton so there's
 * no layout shift when the name loads in.
 */
export default function LoggedUser() {
  const { user, isLoading } = useAuthStore();

  // Skeleton during initial hydration
  if (isLoading) {
    return (
      <div className="flex flex-row gap-2 border border-neutral-800 rounded-full py-1 px-3 items-center justify-center bg-neutral-900 animate-pulse">
        <div className="h-3 w-20 bg-neutral-700 rounded-full" />
        <div className="h-3 w-10 bg-neutral-700 rounded-full" />
      </div>
    );
  }

  // Not logged in — render nothing (middleware should have redirected,
  // but this is a safe fallback for public pages that render this component)
  if (!user) return null;

  const plan = PLAN_STYLES[user.plan] ?? PLAN_STYLES.free;

  return (
    <div className="flex flex-row gap-2 border border-neutral-800 rounded-full py-1 px-3 items-center justify-center bg-neutral-900">
      {/* Name — truncate long names gracefully */}
      <p className="text-neutral-200 text-sm font-medium max-w-[120px] truncate">
        {user.name}
      </p>

      {/* Plan badge */}
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${plan.bg} ${plan.text}`}
      >
        {plan.label}
      </span>
    </div>
  );
}