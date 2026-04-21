import EmptyState from "../empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "../ui/chart";
import { Skeleton } from "../ui/skeleton";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface dailySessionsData {
  date: string;
  sessions: number;
}

interface Props {
  isLoading: boolean;
  dailySessionsData: dailySessionsData[];
  sessionsChartConfig: ChartConfig;
}

export default function SessionsPerdayChart(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions per Day</CardTitle>
        <CardDescription>Daily session count over the period</CardDescription>
      </CardHeader>
      <CardContent>
        {props.isLoading ? (
          <Skeleton className="h-62.5 w-full" />
        ) : props.dailySessionsData.length === 0 ? (
          <EmptyState />
        ) : (
          <ChartContainer config={props.sessionsChartConfig} className="h-62.5 w-full">
            <BarChart data={props.dailySessionsData} accessibilityLayer>
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
  )
}