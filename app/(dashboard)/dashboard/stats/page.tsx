"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Activity,
  Clock,
  MessageSquare,
  Wrench,
  AlertTriangle,
  Zap,
  TrendingUp,
  Hash,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { useProject } from "@/hooks/useProject"
import { useFetch } from "@/hooks/useFetch"

// ── Types ────────────────────────────────────────────────────

interface UsageSummary {
  project_id: string
  since: string
  until: string
  total_sessions: number
  total_turns: number
  total_tool_calls: number
  total_duration_s: number
  avg_duration_s: number
  total_input_tokens: number
  total_output_tokens: number
  total_tokens: number
  error_count: number
  error_rate_pct: number
}

interface Session {
  session_id: string
  project_id: string
  status: string
  started_at: string
  ended_at: string
  duration_seconds: number
  turns: number
  tool_calls: number
  input_tokens: number
  output_tokens: number
  api_key_id: string
  error_message: string | null
}

interface SessionsResponse {
  sessions: Session[]
  total: number
  limit: number
  skip: number
}

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

// ── Helpers ──────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs.toFixed(0)}s`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const STATUS_COLORS: Record<string, string> = {
  closed: "var(--chart-1)",
  timeout: "var(--chart-2)",
  error: "var(--destructive)",
}

// ── Component ────────────────────────────────────────────────

export default function Stats() {
  const { selectedProject } = useProject()
  const fetchWithRefresh = useFetch()
  const projectId = selectedProject?.project_id

  // Fetch usage summary
  const {
    data: usage,
    isLoading: usageLoading,
  } = useQuery<UsageSummary>({
    queryKey: ["usage", projectId],
    queryFn: () => fetchWithRefresh(`/projects/${projectId}/usage`),
    enabled: !!projectId,
    staleTime: 60_000,
  })

  // Fetch sessions list
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
  } = useQuery<SessionsResponse>({
    queryKey: ["sessions", projectId],
    queryFn: () => fetchWithRefresh(`/projects/${projectId}/sessions?limit=50`),
    enabled: !!projectId,
    staleTime: 60_000,
  })

  const sessions = sessionsData?.sessions ?? []
  const isLoading = usageLoading || sessionsLoading

  // ── Derived chart data ─────────────────────────────────────

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
    const day = formatDate(s.started_at)
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
      <div>
        <h1 className="text-2xl font-heading font-semibold tracking-tight">
          Usage &amp; Statistics
        </h1>
        {usage && (
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(usage.since).toLocaleDateString()} –{" "}
            {new Date(usage.until).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* ── KPI Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={<Activity className="h-4 w-4" />}
          label="Total Sessions"
          value={usage?.total_sessions}
          loading={isLoading}
        />
        <KpiCard
          icon={<MessageSquare className="h-4 w-4" />}
          label="Total Turns"
          value={usage?.total_turns}
          loading={isLoading}
        />
        <KpiCard
          icon={<Wrench className="h-4 w-4" />}
          label="Tool Calls"
          value={usage?.total_tool_calls}
          loading={isLoading}
        />
        <KpiCard
          icon={<Zap className="h-4 w-4" />}
          label="Total Tokens"
          value={usage?.total_tokens?.toLocaleString()}
          loading={isLoading}
        />
        <KpiCard
          icon={<Clock className="h-4 w-4" />}
          label="Total Duration"
          value={usage ? formatDuration(usage.total_duration_s) : undefined}
          loading={isLoading}
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Avg Duration"
          value={usage ? formatDuration(usage.avg_duration_s) : undefined}
          loading={isLoading}
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Errors"
          value={usage?.error_count}
          loading={isLoading}
          variant={usage && usage.error_count > 0 ? "destructive" : "default"}
        />
        <KpiCard
          icon={<Hash className="h-4 w-4" />}
          label="Error Rate"
          value={usage ? `${usage.error_rate_pct}%` : undefined}
          loading={isLoading}
          variant={usage && usage.error_rate_pct > 10 ? "destructive" : "default"}
        />
      </div>

      {/* ── Charts Row 1 ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sessions per day */}
        <Card>
          <CardHeader>
            <CardTitle>Sessions per Day</CardTitle>
            <CardDescription>Daily session count over the period</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : dailySessionsData.length === 0 ? (
              <EmptyState />
            ) : (
              <ChartContainer config={sessionsChartConfig} className="h-[250px] w-full">
                <BarChart data={dailySessionsData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="sessions" fill="var(--color-sessions)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
            <CardDescription>Distribution of session outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : statusData.length === 0 ? (
              <EmptyState />
            ) : (
              <ChartContainer config={statusChartConfig} className="h-[250px] w-full">
                <PieChart accessibilityLayer>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={50} strokeWidth={2}>
                    {statusData.map((entry) => (
                      <Cell key={entry.status} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row 2 ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Token usage area chart */}
        <Card>
          <CardHeader>
            <CardTitle>Token Usage per Session</CardTitle>
            <CardDescription>Input vs output tokens (last 15 sessions)</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : tokenData.length === 0 ? (
              <EmptyState />
            ) : (
              <ChartContainer config={tokensChartConfig} className="h-[250px] w-full">
                <AreaChart data={tokenData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} hide />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="input_tokens"
                    fill="var(--color-input_tokens)"
                    fillOpacity={0.3}
                    stroke="var(--color-input_tokens)"
                    stackId="tokens"
                  />
                  <Area
                    type="monotone"
                    dataKey="output_tokens"
                    fill="var(--color-output_tokens)"
                    fillOpacity={0.3}
                    stroke="var(--color-output_tokens)"
                    stackId="tokens"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Session duration bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Session Duration</CardTitle>
            <CardDescription>Duration in seconds (last 15 sessions)</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : durationData.length === 0 ? (
              <EmptyState />
            ) : (
              <ChartContainer config={durationChartConfig} className="h-[250px] w-full">
                <BarChart data={durationData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} hide />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="duration" radius={[4, 4, 0, 0]}>
                    {durationData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.status === "error"
                            ? "var(--destructive)"
                            : "var(--color-duration)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Sessions Table ─────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Last {sessions.length} sessions for this project</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Started</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 font-medium text-right">Duration</th>
                    <th className="pb-2 pr-4 font-medium text-right">Turns</th>
                    <th className="pb-2 pr-4 font-medium text-right">Tools</th>
                    <th className="pb-2 font-medium text-right">Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.session_id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {formatDateTime(s.started_at)}
                      </td>
                      <td className="py-2 pr-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {formatDuration(s.duration_seconds)}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums">{s.turns}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{s.tool_calls}</td>
                      <td className="py-2 text-right tabular-nums">
                        {(s.input_tokens + s.output_tokens).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  loading,
  variant = "default",
}: {
  icon: React.ReactNode
  label: string
  value?: string | number
  loading: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        {loading ? (
          <Skeleton className="h-7 w-20 mt-1" />
        ) : (
          <p
            className={`text-2xl font-semibold tabular-nums ${
              variant === "destructive" ? "text-destructive" : ""
            }`}
          >
            {value ?? "–"}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "error"
      ? "destructive"
      : status === "timeout"
        ? "secondary"
        : "outline"

  return (
    <Badge variant={variant as "destructive" | "secondary" | "outline"} className="capitalize text-xs">
      {status}
    </Badge>
  )
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
      No data available yet.
    </div>
  )
}