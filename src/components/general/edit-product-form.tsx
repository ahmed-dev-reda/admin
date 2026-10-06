"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";
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

export default function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      description: form.get("description"),
      category: form.get("category"),
      price: Number(form.get("price")),
      quantity: Number(form.get("quantity")),
    };
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message ?? "Failed to update product");
      }
      router.push("/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border p-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">Product Name</label>
        <Input id="name" name="name" defaultValue={product.name} placeholder="Enter product name" required />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <Textarea id="description" name="description" defaultValue={product.description} placeholder="Enter product description" rows={5} required />
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">Category</label>
        <Input id="category" name="category" defaultValue={product.category?.name ?? ""} placeholder="Enter category" required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">Price</label>
          <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue={product.price} placeholder="Enter price" required />
        </div>
        <div className="space-y-2">
          <label htmlFor="quantity" className="text-sm font-medium">Quantity</label>
          <Input id="quantity" name="quantity" type="number" min="0" defaultValue={product.quantity} placeholder="Enter quantity" required />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-3 border-t pt-6">
        <Button variant="outline" asChild>
          <Link href="/products">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
