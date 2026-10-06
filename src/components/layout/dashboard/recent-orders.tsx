"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { ArrowUpRight, ShoppingCart } from "lucide-react";
import * as React from "react";

// ── Status badge variant mapping ─────────────────────────────────────────────

function statusVariant(status: string) {
  switch (status) {
    case "Delivered":
      return "default" as const;
    case "Pending":
      return "secondary" as const;
    case "Processing":
      return "outline" as const;
    case "Cancelled":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

function statusDot(status: string) {
  switch (status) {
    case "Delivered":
      return "bg-emerald-500";
    case "Pending":
      return "bg-amber-500";
    case "Processing":
      return "bg-blue-500";
    case "Cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

function toTitle(status: string) {
  if (status === "DELIVERED") return "Delivered";
  if (status === "PENDING") return "Pending";
  if (status === "PROCESSING") return "Processing";
  if (status === "CANCELLED") return "Cancelled";
  return status;
}

export default function RecentOrders() {
  const [orders, setOrders] = React.useState<
    {
      id: string;
      customer: string;
      total: number;
      status: string;
      date: string;
    }[]
  >([]);

  React.useEffect(() => {
    fetch("/api/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json?.success) {
          setOrders(
            (json.data.recentOrders ?? []).map(
              (o: { id: string; customer: string; total: number; status: string; date: string }) => ({
                ...o,
                status: toTitle(o.status),
              }),
            ),
          );
        }
      })
      .catch(() => {});
  }, []);

  const recentOrders = orders.map((o) => ({
    ...o,
    total: `$${Number(o.total).toFixed(2)}`,
    date: new Date(o.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));

  return (
    <Card id="recent-orders" className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription className="mt-1">
              Latest transactions from your store
            </CardDescription>
          </div>
          <a
            href="/orders"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <ShoppingCart className="size-8 text-muted-foreground" />
            </div>
            <p className="font-medium">No orders yet</p>
            <p className="text-sm text-muted-foreground">
              Orders will appear here once customers start purchasing.
            </p>
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="pr-6 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.id} className="group">
                <TableCell className="pl-6 font-medium">{order.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.customer}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.date}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {order.total}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Badge
                    variant={statusVariant(order.status)}
                    className="gap-1.5"
                  >
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${statusDot(order.status)}`}
                    />
                    {order.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
