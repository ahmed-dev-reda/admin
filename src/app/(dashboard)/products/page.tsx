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

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { MoreHorizontal, Package, Pencil, Plus, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string;
  category: { id: string; name: string } | null;
  price: number;
  quantity: number;
  status: string;
};

function statusVariant(status: string) {
  if (status === "In Stock") return "default";
  if (status === "Low Stock") return "secondary";
  return "destructive";
}

function statusDot(status: string) {
  if (status === "In Stock") return "bg-green-500";
  if (status === "Low Stock") return "bg-yellow-500";
  return "bg-red-500";
}

export default function Products() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    fetch("/api/products?limit=100", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json?.error?.message ?? "Failed to load products");
        }
        setProducts(json.data);
        setError(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load products");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      alert(json?.error?.message ?? "Failed to delete product");
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <section className="space-y-6 pb-8 pt-2">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your products and inventory
          </p>
        </div>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 size-4" />
            New Product
          </Link>
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading products…</p>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <Package className="size-8 text-muted-foreground" />
          </div>
          <p className="font-medium">No products found</p>
          <p className="text-sm text-muted-foreground">
            Get started by adding your first product.
          </p>
          <Button asChild className="mt-2">
            <Link href="/products/new">
              <Plus className="mr-2 size-4" />
              New Product
            </Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Price</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="pr-6 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="group">
                <TableCell className="pl-6">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {product.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.category?.name ?? "—"}</TableCell>
                <TableCell className="text-center font-mono tabular-nums">
                  {product.price} EGP
                </TableCell>
                <TableCell className="text-center font-mono tabular-nums">
                  {product.quantity}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={statusVariant(product.status)}
                    className="gap-1.5"
                  >
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${statusDot(product.status)}`}
                    />
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/products/${product.id}/edit`}>
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
