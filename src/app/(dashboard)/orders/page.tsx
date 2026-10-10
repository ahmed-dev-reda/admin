"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus } from "lucide-react";
import Link from "next/link";

type Sale = {
  id: string;
  status: string;
  total: number;
  customer: { id: string; name: string; email: string | null } | null;
  customerId: string | null;
  userId: string | null;
  items: {
    id: string;
    productId: string;
    productName: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  createdAt: string;
  updatedAt: string;
};

function statusVariant(status: string) {
  if (status === "DELIVERED") return "default" as const;
  if (status === "PENDING") return "secondary" as const;
  if (status === "PROCESSING") return "outline" as const;
  if (status === "CANCELLED") return "destructive" as const;
  return "secondary" as const;
}

function statusDot(status: string) {
  if (status === "DELIVERED") return "bg-emerald-500";
  if (status === "PENDING") return "bg-amber-500";
  if (status === "PROCESSING") return "bg-blue-500";
  if (status === "CANCELLED") return "bg-red-500";
  return "bg-gray-500";
}

export default function OrdersPage() {
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/sales?limit=100", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json?.error?.message ?? "Failed to load orders");
        }
        setSales(json.data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load orders"))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="space-y-6 pb-8 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage customer orders and track their status
          </p>
        </div>
        <Button asChild>
          <Link href="/orders/new">
            <Plus className="mr-2 size-4" />
            New Order
          </Link>
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading orders…</p>
      ) : sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
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
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="pr-6 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id} className="group">
                <TableCell className="pl-6 font-medium">
                  <Link href={`/orders/${sale.id}`} className="hover:underline">
                    #{sale.id.slice(-8).toUpperCase()}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {new Date(sale.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{sale.customer?.name ?? "Guest"}</div>
                    {sale.customer?.email && (
                      <div className="text-xs text-muted-foreground">
                        {sale.customer.email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center font-mono tabular-nums">
                  {sale.items.reduce((sum, item) => sum + item.quantity, 0)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  ${sale.total.toFixed(2)}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Badge variant={statusVariant(sale.status)} className="gap-1.5">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${statusDot(sale.status)}`}
                    />
                    {sale.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
