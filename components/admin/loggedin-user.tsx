"use client";

import { useAuth } from "@/hooks/useAuth";
import { PLAN_STYLES } from "@/lib/constants";

export default function LoggedUser() {
  const { user, isLoading, error } = useAuth();

  // Skeleton during initial hydration
  if (isLoading) {
    return (
      <div className="flex flex-row items-center justify-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2 animate-pulse">
        <div className="h-3 w-20 rounded-full bg-muted" />
        <div className="h-3 w-10 rounded-full bg-muted" />
      </div>
    );
  }

  // Show error state if hydration failed
  if (error) {
    console.error("[LoggedUser] Auth hydration error:", error);
    return (
      <div className="text-xs font-medium px-2 py-0.5 rounded bg-red-900 text-red-300">
        Auth Error
      </div>
    );
  }

  // Not logged in — render nothing (middleware should have redirected,
  // but this is a safe fallback for public pages that render this component)
  if (!user) return null;

  const plan = PLAN_STYLES[user.plan] ?? PLAN_STYLES.free;

  return (
    <div className="flex flex-row items-center justify-center gap-2 rounded-full border border-border/70 bg-background/70 py-1.5 pl-2.5 pr-1.5 backdrop-blur-sm">
      <p className="max-w-[120px] truncate text-sm font-medium text-foreground">
        {user.name}
      </p>

      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${plan.bg} ${plan.text}`}
      >
        {plan.label}
      </span>
    </div>
  );
}