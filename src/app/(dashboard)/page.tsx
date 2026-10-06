"use client";

import ChartAreaInteractive from "@/components/layout/dashboard/chart-area-interactive";
import Cards from "@/components/layout/dashboard/cards";
import TopProducts from "@/components/layout/dashboard/top-products";
import RecentOrders from "@/components/layout/dashboard/recent-orders";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <section className="space-y-6 pb-8 pt-2">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back — here&apos;s what&apos;s happening with your store.
        </p>
      </div>

      <Cards />

      {/* ── Sales Overview Chart ────────────────────────────────────────── */}
      <ChartAreaInteractive />

      {/* ── Bottom Grid: Recent Orders + Top Products ───────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        <RecentOrders />
        <TopProducts />
      </div>
    </section>
  );
}
