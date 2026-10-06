"use client";

import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card";
import * as React from "react";
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown } from "lucide-react";

const iconMap = {
  totalRevenue: DollarSign,
  totalOrders: ShoppingCart,
  totalProducts: Package,
  totalCustomers: Users,
} as const;

type StatsCards = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
};

export default function Cards() {
  const [cards, setCards] = React.useState<StatsCards | null>(null);

  React.useEffect(() => {
    fetch("/api/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json?.success) setCards(json.data.cards);
      })
      .catch(() => {});
  }, []);

  const stats = [
    {
      id: "total-sales",
      title: "Total Sales",
      value: cards ? `$${cards.totalRevenue.toLocaleString()}` : "—",
      change: cards ? `${cards.revenueChange >= 0 ? "+" : ""}${cards.revenueChange}%` : "—",
      trend: (cards?.revenueChange ?? 0) >= 0 ? ("up" as const) : ("down" as const),
      icon: DollarSign,
      description: "vs last month",
    },
    {
      id: "total-orders",
      title: "Total Orders",
      value: cards ? cards.totalOrders.toLocaleString() : "—",
      change: cards ? `${cards.ordersChange >= 0 ? "+" : ""}${cards.ordersChange}%` : "—",
      trend: (cards?.ordersChange ?? 0) >= 0 ? ("up" as const) : ("down" as const),
      icon: ShoppingCart,
      description: "vs last month",
    },
    {
      id: "products",
      title: "Products",
      value: cards ? cards.totalProducts.toLocaleString() : "—",
      change: "",
      trend: "up" as const,
      icon: Package,
      description: "active listings",
    },
    {
      id: "customers",
      title: "Customers",
      value: cards ? cards.totalCustomers.toLocaleString() : "—",
      change: "",
      trend: "up" as const,
      icon: Users,
      description: "total registered",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.id}
          id={stat.id}
          className="relative overflow-hidden transition-shadow hover:shadow-md"
        >
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
              {stat.value}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs">
              {stat.trend === "up" ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={
                  stat.trend === "up" ? "text-emerald-500" : "text-red-500"
                }
              >
                {stat.change}
              </span>
              <span className="text-muted-foreground">{stat.description}</span>
            </div>
          </CardContent>
          {/* Decorative gradient accent */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5"
            style={{
              background:
                stat.trend === "up"
                  ? "linear-gradient(90deg, oklch(0.72 0.18 170), oklch(0.65 0.2 260))"
                  : "linear-gradient(90deg, oklch(0.65 0.2 25), oklch(0.55 0.22 15))",
            }}
          />
        </Card>
      ))}
    </div>
  );
}
