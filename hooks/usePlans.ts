/**
 * hooks/usePlans.ts
 * ------------------
 * Hook that fetches the current tenant's plan and all available plans
 * using TanStack Query.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "./useAuth";
import { useFetch } from "./useFetch";
import {
  planSchema,
  currentPlanSchema,
  type Plan,
  type CurrentPlan,
} from "@/lib/schemas/plan-schemas";

export type { Plan, CurrentPlan };

const ALL_PLANS_KEY = ["plans", "all"];
const CURRENT_PLAN_KEY = ["plans", "current"];

export function usePlans() {
  const { user } = useAuth();
  const fetchWithRefresh = useFetch();

  // ── Fetch all available plans ──────────────────────────────

  const {
    data: plans = [],
    isLoading: isLoadingPlans,
    error: plansError,
  } = useQuery({
    queryKey: ALL_PLANS_KEY,
    queryFn: async (): Promise<Plan[]> => {
      const data = await fetchWithRefresh<unknown[]>("/plans");
      return z.array(planSchema).parse(data);
    },
    enabled: !!user,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: false,
  });

  // ── Fetch current tenant's plan ────────────────────────────

  const {
    data: currentPlan = null,
    isLoading: isLoadingCurrentPlan,
    error: currentPlanError,
  } = useQuery({
    queryKey: CURRENT_PLAN_KEY,
    queryFn: async (): Promise<CurrentPlan> => {
      const data = await fetchWithRefresh<unknown>("/plans/current");
      return currentPlanSchema.parse(data);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });

  const error = plansError || currentPlanError
    ? (plansError?.message ?? currentPlanError?.message ?? "Unknown error")
    : null;

  return {
    plans,
    currentPlan,
    isLoadingPlans,
    isLoadingCurrentPlan,
    error,
  };
}
