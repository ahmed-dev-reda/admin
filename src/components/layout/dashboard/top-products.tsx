"use client";

import { TrendingUp, Package } from "lucide-react";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";

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

import * as React from "react";

export const description = "Top selling products bar chart";

// Distinct color per rank — uses chart palette vars
const BAR_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const chartConfig = {
  sold: {
    label: "Units Sold",
  },
} satisfies ChartConfig;

type TopProduct = { name: string; sold: number; revenue: number };

export default function TopProducts() {
  const [chartData, setChartData] = React.useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json?.success) {
          setChartData(json.data.topProducts ?? []);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const totalSold = chartData.reduce((sum, p) => sum + p.sold, 0);
  const totalRevenue = chartData.reduce((sum, p) => sum + p.revenue, 0);
  const top = chartData[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Best selling products by units sold</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <Package className="size-8 text-muted-foreground" />
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
              margin={{ left: 8, right: 16 }}
            >
              <XAxis type="number" dataKey="sold" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={110}
                tickFormatter={(value: string) =>
                  value.length > 14 ? `${value.slice(0, 13)}…` : value
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name, item) => {
                      const p = item?.payload as TopProduct | undefined;
                      return (
                        <>
                          <div className="font-medium">
                            {Number(value).toLocaleString()} sold
                          </div>
                          {p && (
                            <div className="text-muted-foreground">
                              {p.revenue.toLocaleString()} EGP revenue
                            </div>
                          )}
                        </>
                      );
                    }}
                  />
                }
              />
              <Bar dataKey="sold" radius={5}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      {chartData.length > 0 && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            {top.name} leads with {top.sold.toLocaleString()} sold{" "}
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            {totalSold.toLocaleString()} units ·{" "}
            {totalRevenue.toLocaleString()} EGP revenue across top products
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
