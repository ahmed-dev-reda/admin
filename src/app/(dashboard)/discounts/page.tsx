/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useCallback, useEffect } from "react";
import { BadgePercent, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Discount = {
  id: string;
  code: string;
  description: string | null;
  amount: string;
  type: string;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
};

function formatAmount(amount: string, type: string) {
  const n = parseFloat(amount);
  return type === "PERCENTAGE" ? `${n}%` : `$${n.toFixed(2)}`;
}

function DiscountStatus({
  active,
  expiresAt,
}: {
  active: boolean;
  expiresAt: string | null;
}) {
  const expired = expiresAt ? new Date(expiresAt) < new Date() : false;
  if (expired) return <Badge variant="destructive">Expired</Badge>;
  if (!active) return <Badge variant="secondary">Inactive</Badge>;
  return (
    <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
      Active
    </Badge>
  );
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    fetch("/api/discounts", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success)
          throw new Error(json?.error?.message ?? "Failed to load");
        setDiscounts(json.data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/discounts?id=${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message ?? "Failed to delete discount");
      }
      load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete discount",
      );
    }
  };

  return (
    <section className="space-y-6 pb-8 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discounts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage discount codes
          </p>
        </div>
        <Button asChild>
          <Link href="/discounts/new">
            <Plus className="mr-2 size-4" />
            New Discount
          </Link>
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading discounts…</p>
      ) : discounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <BadgePercent className="size-8 text-muted-foreground" />
          </div>
          <p className="font-medium">No discounts yet</p>
          <p className="text-sm text-muted-foreground">
            Create discount codes to offer promotions to your customers.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell className="pl-6 font-mono font-semibold tracking-wide">
                  {discount.code}
                  {discount.description && (
                    <p className="text-xs text-muted-foreground font-sans font-normal mt-0.5 truncate max-w-[200px]">
                      {discount.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {discount.type === "PERCENTAGE" ? "Percentage" : "Fixed"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {formatAmount(discount.amount, discount.type)}
                </TableCell>
                <TableCell>
                  <DiscountStatus
                    active={discount.active}
                    expiresAt={discount.expiresAt}
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {discount.expiresAt
                    ? new Date(discount.expiresAt).toDateString()
                    : "—"}
                </TableCell>
                <TableCell className="pr-6">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(discount.id)}
                    >
                      <Trash className="size-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
