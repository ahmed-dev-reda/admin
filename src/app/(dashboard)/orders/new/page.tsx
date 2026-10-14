"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Minus, Plus, Save, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  category: { id: string; name: string } | null;
};

type Customer = {
  id: string;
  name: string;
  email: string;
};

type OrderLine = {
  product: Product;
  quantity: number;
};

const STATUSES = ["PENDING", "PROCESSING", "DELIVERED", "CANCELLED"] as const;
const PAYMENT_METHODS = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "visa", label: "Visa" },
] as const;

export default function NewOrderPage() {
  const router = useRouter();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [search, setSearch] = React.useState("");
  const [lines, setLines] = React.useState<OrderLine[]>([]);
  const [customerId, setCustomerId] = React.useState<string>("none");
  const [status, setStatus] = React.useState<string>("PENDING");
  const [paymentMethod, setPaymentMethod] = React.useState<string>("cod");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams({ limit: "20" });
      if (search) params.set("search", search);
      fetch(`/api/products?${params}`, { cache: "no-store" })
        .then(async (res) => {
          const json = await res.json();
          if (json?.success) setProducts(json.data);
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  React.useEffect(() => {
    fetch("/api/customers?limit=100", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (json?.success) setCustomers(json.data);
      })
      .catch(() => {});
  }, []);

  const addProduct = (product: Product) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id
            ? { ...l, quantity: Math.min(l.quantity + 1, product.quantity) }
            : l,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setError(null);
  };

  const setLineQuantity = (productId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.product.id !== productId)
        : prev.map((l) =>
            l.product.id === productId
              ? { ...l, quantity: Math.min(quantity, l.product.quantity) }
              : l,
          ),
    );
  };

  const removeLine = (productId: string) => {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  };

  const total = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      setError("Add at least one product to the order.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId === "none" ? null : customerId,
          status,
          paymentMethod,
          items: lines.map((l) => ({
            productId: l.product.id,
            quantity: l.quantity,
          })),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message ?? "Failed to create order");
      }
      router.push("/orders");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8 pt-2">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/orders">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">New Order</h1>
          <p className="text-sm text-muted-foreground">
            Create a sale manually from the admin panel
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Search and add products to the order.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {lines.length === 0 ? (
                <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                  No products added yet. Use search above or the list below.
                </p>
              ) : (
                <div className="divide-y rounded-lg border">
                  {lines.map((line) => (
                    <div key={line.product.id} className="flex items-center justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{line.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {line.product.price.toFixed(2)} EGP · stock: {line.product.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-md border">
                          <button
                            type="button"
                            onClick={() => setLineQuantity(line.product.id, line.quantity - 1)}
                            className="p-1.5 hover:bg-muted"
                            aria-label="Decrease"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setLineQuantity(line.product.id, line.quantity + 1)}
                            className="p-1.5 hover:bg-muted"
                            aria-label="Increase"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <span className="w-20 text-right text-sm font-semibold tabular-nums">
                          {(line.product.price * line.quantity).toFixed(2)} EGP
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive"
                          onClick={() => removeLine(line.product.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {products.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Quick add</p>
                  <div className="flex flex-wrap gap-2">
                    {products
                      .filter((p) => !lines.some((l) => l.product.id === p.id))
                      .slice(0, 8)
                      .map((p) => (
                        <Button
                          key={p.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={p.quantity <= 0}
                          onClick={() => addProduct(p)}
                        >
                          <Plus className="mr-1 size-3" />
                          {p.name} ({p.price.toFixed(2)} EGP)
                        </Button>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer & options */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Customer (optional)</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Guest checkout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Guest checkout</SelectItem>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Payment method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm font-medium">Total</span>
                <span className="text-xl font-bold tabular-nums">{total.toFixed(2)} EGP</span>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                Create Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
