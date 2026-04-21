import { formatDateTime, formatDuration } from "@/lib/utils";
import EmptyState from "../empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import StatusBadge from "./status-badge";
import { Session } from "@/lib/schemas/project-schemas";

interface Props {
  sessions: Session[],
  isLoading: boolean,
}

export default function RecentSessionsTable(props:Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sessions</CardTitle>
        <CardDescription>Last {props.sessions.length} sessions for this project</CardDescription>
      </CardHeader>
      <CardContent>
        {props.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : props.sessions.length === 0 ? (
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
                  <th className="pb-2 font-medium text-right">Input Tokens</th>
                  <th className="pb-2 font-medium text-right">Output Tokens</th>
                  <th className="pb-2 font-medium text-right">Total Tokens</th>
                </tr>
              </thead>
              <tbody>
                {props.sessions.map((s) => (
                  <tr key={s.session_id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 pr-4 whitespace-nowrap">{formatDateTime(s.started_at)}</td>
                    <td className="py-2 pr-4"><StatusBadge status={s.status} /></td>
                    <td className="py-2 pr-4 text-right tabular-nums">{formatDuration(s.duration_seconds)}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{s.turns}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{s.tool_calls}</td>
                    <td className="py-2 text-right tabular-nums">{(s.input_tokens).toLocaleString()}</td>
                    <td className="py-2 text-right tabular-nums">{(s.output_tokens).toLocaleString()}</td>
                    <td className="py-2 text-right tabular-nums">{(s.input_tokens + s.output_tokens).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}