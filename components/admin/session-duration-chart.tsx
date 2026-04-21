import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import EmptyState from "../empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Skeleton } from "../ui/skeleton";

interface durationData {
  label: string;
  duration: number;
  status: string;
}

interface Props {
  isLoading: boolean,
  durationChartConfig: ChartConfig,
  durationData: durationData[],
}

export default function SessionDurationChart(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Duration</CardTitle>
        <CardDescription>Duration in seconds (last 15 sessions)</CardDescription>
      </CardHeader>
      <CardContent>
        {props.isLoading ? (
          <Skeleton className="h-62.5 w-full" />
        ) : props.durationData.length === 0 ? (
          <EmptyState />
        ) : (
          <ChartContainer config={props.durationChartConfig} className="h-62.5 w-full">
            <BarChart data={props.durationData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} hide />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="duration" radius={[4, 4, 0, 0]}>
                {props.durationData.map((entry, i) => (
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
  )
}