"use client"

import {
  ChartConfig,
} from "@/components/ui/chart"
import { useProject } from "@/hooks/useProject"
import { formatShortDate, formatDateTime } from "@/lib/utils"
import RecentSessionsTable from "@/components/admin/recent-sessions-table"
import KpiCardsSection from "@/components/admin/kpi-cards-section"
import SessionsPerdayChart from "@/components/admin/sessions-perday-chart"
import SessionStatusDistributionChart from "@/components/admin/session-status-distribution-chart"
import SessionDurationChart from "@/components/admin/session-duration-chart"
import TokenUsagePerSessionChart from "@/components/admin/token-usage-per-session-chart"

// ── Chart configs ────────────────────────────────────────────

const statusChartConfig = {
  closed: { label: "Closed", color: "var(--chart-1)" },
  timeout: { label: "Timeout", color: "var(--chart-2)" },
  error: { label: "Error", color: "var(--destructive)" },
} satisfies ChartConfig

const tokensChartConfig = {
  input_tokens: { label: "Input Tokens", color: "var(--chart-1)" },
  output_tokens: { label: "Output Tokens", color: "var(--chart-2)" },
} satisfies ChartConfig

const sessionsChartConfig = {
  sessions: { label: "Sessions", color: "var(--chart-1)" },
} satisfies ChartConfig

const durationChartConfig = {
  duration: { label: "Duration (s)", color: "var(--chart-2)" },
} satisfies ChartConfig

const STATUS_COLORS: Record<string, string> = {
  closed: "var(--chart-1)",
  timeout: "var(--chart-2)",
  error: "var(--destructive)",
}

// ── Component ────────────────────────────────────────────────

export default function Stats() {
  const { selectedProject, usage, isLoadingUsage, sessionsData, isLoadingSessions } = useProject()
  const projectId = selectedProject?.project_id

  const sessions = sessionsData?.sessions ?? []
  const isLoading = isLoadingUsage || isLoadingSessions

  // ── Derived chart data ─────────────────────────────

  // Status distribution for pie chart
  const statusCounts = sessions.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {})
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    fill: STATUS_COLORS[status] ?? "var(--chart-3)",
  }))

  // Sessions per day for bar chart
  const sessionsPerDay = sessions.reduce<Record<string, number>>((acc, s) => {
    const day = formatShortDate(s.started_at)
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {})
  const dailySessionsData = Object.entries(sessionsPerDay)
    .map(([date, sessions]) => ({ date, sessions }))
    .reverse()

  // Token usage per session (area chart) — most recent 15
  const tokenData = [...sessions]
    .reverse()
    .slice(-15)
    .map((s) => ({
      label: formatDateTime(s.started_at),
      input_tokens: s.input_tokens,
      output_tokens: s.output_tokens,
    }))

  // Duration per session (bar chart) — most recent 15
  const durationData = [...sessions]
    .reverse()
    .slice(-15)
    .map((s) => ({
      label: formatDateTime(s.started_at),
      duration: s.duration_seconds,
      status: s.status,
    }))

  // ── No project selected ────────────────────────────────────

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Select a project to view usage statistics.
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="brand-panel px-5 py-5 sm:px-6">
        <h1 className="text-2xl font-heading font-semibold tracking-tight">
          Usage &amp; Statistics
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Monitor how each project is performing across session volume, token consumption, status distribution, and recent activity.
        </p>
        {usage && (
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {new Date(usage.since).toLocaleDateString()} – {new Date(usage.until).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* KPI Cards */}
      <KpiCardsSection usage={usage} isLoading={isLoading} />
      

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Sessions per day */}
        <SessionsPerdayChart isLoading={isLoading} dailySessionsData={dailySessionsData} sessionsChartConfig={sessionsChartConfig} />

        {/* Status distribution */}
        <SessionStatusDistributionChart isLoading={isLoading} statusChartConfig={statusChartConfig} statusData={statusData} />
      </div>

      {/* ── Charts Row 2 ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Token usage area chart */}
        <TokenUsagePerSessionChart isLoading={isLoading} tokensChartConfig={tokensChartConfig} tokenData={tokenData} />

        {/* Session duration bar chart */}
        <SessionDurationChart isLoading={isLoading} durationChartConfig={durationChartConfig} durationData={durationData} />
      </div>

      {/* ── Recent Sessions Table ─────────────────────────── */}
      <RecentSessionsTable sessions={sessions} isLoading={isLoading} />
    </div>
  )
}
