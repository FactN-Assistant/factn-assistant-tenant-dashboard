"use client";

import { useAuth } from "@/hooks/useAuth";
import { PLAN_STYLES } from "@/lib/constants";

export default function LoggedUser() {
  const { user, isLoading, error } = useAuth();

  // Skeleton during initial hydration
  if (isLoading) {
    return (
      <div className="flex flex-row gap-2 border border-neutral-800 rounded-full py-1 px-3 items-center justify-center bg-neutral-900 animate-pulse">
        <div className="h-3 w-20 bg-neutral-700 rounded-full" />
        <div className="h-3 w-10 bg-neutral-700 rounded-full" />
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
    <div className="flex flex-row gap-2 border border-neutral-800 rounded-full py-1 pl-2 pr-1 items-center justify-center bg-neutral-900">
      <p className="text-neutral-200 text-sm font-medium max-w-[120px] truncate">
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