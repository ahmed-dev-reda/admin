"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DollarSign,
  ShoppingCart,
  Receipt,
  TrendingUp,
  ChartNoAxesCombined,
} from "lucide-react";
import { Cell, Pie, PieChart, Bar, BarChart, XAxis, YAxis } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "var(--chart-3)",
  PROCESSING: "var(--chart-2)",
  DELIVERED: "var(--chart-1)",
  CANCELLED: "var(--chart-4)",
};

const CATEGORY_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type StatsData = {
  cards: { totalRevenue: number; totalOrders: number };
  monthlyRevenue: number;
  salesByDay: { date: string; revenue: number; orders: number }[];
  salesByStatus: { status: string; count: number }[];
  revenueByCategory: { name: string; revenue: number; orders: number }[];
  topProducts: { name: string; sold: number; revenue: number }[];
};

const statusConfig = {
  count: { label: "Orders" },
} satisfies ChartConfig;

const categoryConfig = {
  revenue: { label: "Revenue" },
} satisfies ChartConfig;

const trendConfig = {
  revenue: { label: "Revenue", color: "var(--chart-revenue)" },
} satisfies ChartConfig;

function DonutEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <ChartNoAxesCombined className="size-8 text-muted-foreground" />
      </div>
      <p className="font-medium">No data yet</p>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = React.useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json?.success) setData(json.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const avgOrderValue =
    data && data.cards.totalOrders > 0
      ? data.cards.totalRevenue / data.cards.totalOrders
      : 0;

  const cards = [
    {
      title: "Monthly Revenue",
      value: data ? `$${data.monthlyRevenue.toLocaleString()}` : "—",
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: data ? data.cards.totalOrders.toLocaleString() : "—",
      icon: ShoppingCart,
    },
    {
      title: "Avg. Order Value",
      value: data ? `$${avgOrderValue.toFixed(2)}` : "—",
      icon: Receipt,
    },
    {
      title: "Total Revenue",
      value: data ? `$${data.cards.totalRevenue.toLocaleString()}` : "—",
      icon: TrendingUp,
    },
  ];

  return (
    <section className="space-y-6 pb-8 pt-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Detailed insights into your store performance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-sm font-medium">
                {stat.title}
              </CardDescription>
              <div className="rounded-lg bg-muted p-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {isLoading ? "—" : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue by category donut */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>Where your revenue comes from</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-56 items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : !data || data.revenueByCategory.length === 0 ? (
              <DonutEmpty message="Category revenue will appear here once you have sales." />
            ) : (
              <ChartContainer config={categoryConfig} className="h-56 w-full">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value) => (
                          <span className="font-medium">
                            ${Number(value).toLocaleString()}
                          </span>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={data.revenueByCategory}
                    dataKey="revenue"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {data.revenueByCategory.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
            {data && data.revenueByCategory.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {data.revenueByCategory.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                    />
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground">
                      ${c.revenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders by status donut */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Distribution of order states</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-56 items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : !data || data.salesByStatus.length === 0 ? (
              <DonutEmpty message="Order statuses will appear here once you have orders." />
            ) : (
              <ChartContainer config={statusConfig} className="h-56 w-full">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value) => (
                          <span className="font-medium">
                            {Number(value).toLocaleString()} orders
                          </span>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={data.salesByStatus}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {data.salesByStatus.map((s) => (
                      <Cell
                        key={s.status}
                        fill={STATUS_COLORS[s.status] ?? "var(--chart-5)"}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
            {data && data.salesByStatus.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {data.salesByStatus.map((s) => (
                  <div key={s.status} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ background: STATUS_COLORS[s.status] ?? "var(--chart-5)" }}
                    />
                    <span className="font-medium">{s.status}</span>
                    <span className="text-muted-foreground">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily revenue bars */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Revenue</CardTitle>
          <CardDescription>Revenue per day for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-56 items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : !data || data.salesByDay.length === 0 ? (
            <DonutEmpty message="Daily revenue will appear here once you have sales." />
          ) : (
            <ChartContainer config={trendConfig} className="h-56 w-full">
              <BarChart
                accessibilityLayer
                data={data.salesByDay.slice(-30)}
                margin={{ left: -10, right: 8 }}
              >
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={40}
                  tickFormatter={(value: string) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: number) => `$${value}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                      formatter={(value) => (
                        <span className="font-medium">
                          ${Number(value).toLocaleString()}
                        </span>
                      )}
                    />
                  }
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
