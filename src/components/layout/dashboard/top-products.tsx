"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export const description = "A horizontal bar chart";

import * as React from "react";

const chartConfig = {
  desktop: {
    label: "Units Sold",
    color: "blue",
  },
} satisfies ChartConfig;

export default function TopProducts() {
  const [chartData, setChartData] = React.useState<
    { month: string; desktop: number }[]
  >([]);

  React.useEffect(() => {
    fetch("/api/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json?.success) {
          setChartData(
            (json.data.topProducts ?? []).map(
              (p: { name: string; sold: number }) => ({
                month: p.name,
                desktop: p.sold,
              }),
            ),
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Best selling products</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <TrendingUp className="size-8 text-muted-foreground" />
            </div>
            <p className="font-medium">No sales data yet</p>
            <p className="text-sm text-muted-foreground">
              Top products will appear here once you make sales.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                left: -20,
              }}
            >
              <XAxis type="number" dataKey="desktop" hide />
              <YAxis
                dataKey="month"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="desktop" fill="var(--color-desktop)" radius={5} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
