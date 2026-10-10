"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartNoAxesCombined, TrendingUp, Users, DollarSign, ShoppingCart } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <section className="space-y-6 pb-8 pt-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Detailed insights into your store performance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Conversion Rate", value: "3.2%", icon: TrendingUp, change: "+0.5%" },
          { title: "Avg. Order Value", value: "$87.50", icon: DollarSign, change: "+12%" },
          { title: "Total Visitors", value: "12,450", icon: Users, change: "+8%" },
          { title: "Cart Abandonment", value: "68%", icon: ShoppingCart, change: "-2%" },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-sm font-medium">{stat.title}</CardDescription>
              <div className="rounded-lg bg-muted p-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <div className="mt-1 flex items-center gap-1 text-xs">
                <span className="text-emerald-500">{stat.change}</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Monthly revenue over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <ChartNoAxesCombined className="size-8 text-muted-foreground" />
            </div>
            <p className="font-medium">No analytics data yet</p>
            <p className="text-sm text-muted-foreground">
              Detailed analytics will appear here once you have sales data.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
