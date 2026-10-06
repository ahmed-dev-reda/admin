import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalRevenueAgg,
    monthRevenueAgg,
    lastMonthRevenueAgg,
    totalOrders,
    monthOrders,
    lastMonthOrders,
    totalProducts,
    totalCustomers,
    lowStockProducts,
    salesByDay,
    topProducts,
    recentOrders,
    salesByStatus,
  ] = await Promise.all([
    prisma.sale.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    prisma.sale.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfMonth } },
    }),
    prisma.sale.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
    }),
    prisma.sale.count(),
    prisma.sale.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.sale.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    prisma.product.count(),
    prisma.customer.count(),
    prisma.product.findMany({
      where: { quantity: { lt: 10 } },
      select: { id: true, name: true, quantity: true },
      orderBy: { quantity: "asc" },
      take: 10,
    }),
    prisma.$queryRaw<{ date: string; revenue: number; orders: bigint }[]>`
      SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') AS date,
             COALESCE(SUM("total"), 0)::float AS revenue,
             COUNT(*)::bigint AS orders
      FROM "Sale"
      WHERE "status" <> 'CANCELLED'
        AND "createdAt" >= NOW() - INTERVAL '90 days'
      GROUP BY 1
      ORDER BY 1 ASC
    `,
    prisma.$queryRaw<{ name: string; sold: bigint; revenue: number }[]>`
      SELECT p."name" AS name,
             SUM(si."quantity")::bigint AS sold,
             COALESCE(SUM(si."subtotal"), 0)::float AS revenue
      FROM "SaleItem" si
      JOIN "Product" p ON p."id" = si."productId"
      GROUP BY p."name"
      ORDER BY sold DESC
      LIMIT 5
    `,
    prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { customer: true },
    }),
    prisma.sale.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const pct = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  };

  const totalRevenue = Number(totalRevenueAgg._sum.total ?? 0);
  const monthRevenue = Number(monthRevenueAgg._sum.total ?? 0);
  const lastMonthRevenue = Number(lastMonthRevenueAgg._sum.total ?? 0);

  return {
    cards: {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      revenueChange: pct(monthRevenue, lastMonthRevenue),
      ordersChange: pct(monthOrders, lastMonthOrders),
      customersTotal: totalCustomers,
    },
    monthlyRevenue: monthRevenue,
    lowStockProducts,
    salesByDay: salesByDay.map((d) => ({
      date: d.date,
      revenue: Number(d.revenue),
      orders: Number(d.orders),
    })),
    topProducts: topProducts.map((p) => ({
      name: p.name,
      sold: Number(p.sold),
      revenue: Number(p.revenue),
    })),
    salesByStatus: salesByStatus.map((s) => ({
      status: s.status,
      count: s._count._all,
    })),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      customer: o.customer?.name ?? "Guest",
      email: o.customer?.email ?? null,
      total: Number(o.total),
      status: o.status,
      date: o.createdAt,
    })),
  };
}
