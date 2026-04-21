import { Cell, Pie, PieChart } from "recharts";
import EmptyState from "../empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Skeleton } from "../ui/skeleton";

interface StatusData {
    status: string;
    count: number;
    fill: string;
}

interface Props {
  isLoading: boolean,
  statusChartConfig: ChartConfig,
  statusData: StatusData[],
}

export default function SessionStatusDistributionChart(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Status</CardTitle>
        <CardDescription>Distribution of session outcomes</CardDescription>
      </CardHeader>
      <CardContent>
        {props.isLoading ? (
          <Skeleton className="h-62.5 w-full" />
        ) : props.statusData.length === 0 ? (
          <EmptyState />
        ) : (
          <ChartContainer config={props.statusChartConfig} className="h-62.5 w-full">
            <PieChart accessibilityLayer>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={props.statusData} dataKey="count" nameKey="status" innerRadius={50} strokeWidth={2}>
                {props.statusData.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="status" />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}