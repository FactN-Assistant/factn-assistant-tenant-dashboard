import { Activity, AlertTriangle, Clock, Hash, MessageSquare, TrendingUp, Wrench, Zap } from "lucide-react";
import KpiCard from "./kpi-card";
import { UsageSummary } from "@/hooks/useProject";
import { formatDuration } from "@/lib/utils";

interface Props {
 usage: UsageSummary|null,
 isLoading: boolean,
}

export default function KpiCardsSection(props: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={<Activity className="h-4 w-4" />}
          label="Total Sessions"
          value={props.usage?.total_sessions}
          loading={props.isLoading}
        />
        <KpiCard
          icon={<MessageSquare className="h-4 w-4" />}
          label="Total Turns"
          value={props.usage?.total_turns}
          loading={props.isLoading}
        />
        <KpiCard
          icon={<Wrench className="h-4 w-4" />}
          label="Tool Calls"
          value={props.usage?.total_tool_calls}
          loading={props.isLoading}
        />
        <KpiCard
          icon={<Zap className="h-4 w-4" />}
          label="Total Tokens"
          value={props.usage?.total_tokens?.toLocaleString()}
          loading={props.isLoading}
        />
        <KpiCard
          icon={<Clock className="h-4 w-4" />}
          label="Total Duration"
          value={props.usage ? formatDuration(props.usage.total_duration_s) : undefined}
          loading={props.isLoading}
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Avg Duration"
          value={props.usage ? formatDuration(props.usage.avg_duration_s) : undefined}
          loading={props.isLoading}
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Errors"
          value={props.usage?.error_count}
          loading={props.isLoading}
          variant={props.usage && props.usage.error_count > 0 ? "destructive" : "default"}
        />
        <KpiCard
          icon={<Hash className="h-4 w-4" />}
          label="Error Rate"
          value={props.usage ? `${props.usage.error_rate_pct}%` : undefined}
          loading={props.isLoading}
          variant={props.usage && props.usage.error_rate_pct > 10 ? "destructive" : "default"}
        />
      </div>
  )
}