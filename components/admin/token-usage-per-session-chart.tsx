import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import EmptyState from "../empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Skeleton } from "../ui/skeleton";

interface TokenData {
  label: string;
  input_tokens: number;
  output_tokens: number;
}

interface Props {
  isLoading: boolean,
  tokensChartConfig: ChartConfig,
  tokenData: TokenData[],
}

export default function TokenUsagePerSessionChart(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Usage per Session</CardTitle>
        <CardDescription>Input vs output tokens (last 15 sessions)</CardDescription>
      </CardHeader>
      <CardContent>
        {props.isLoading ? (
          <Skeleton className="h-62.5 w-full" />
        ) : props.tokenData.length === 0 ? (
          <EmptyState />
        ) : (
          <ChartContainer config={props.tokensChartConfig} className="h-62.5 w-full">
            <AreaChart data={props.tokenData} accessibilityLayer>
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
  )
}