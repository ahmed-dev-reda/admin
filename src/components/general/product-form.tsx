"use client";

import * as React from "react";
import { ArrowLeft, Loader2, CheckCircle2, Package } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Types ─────────────────────────────────────────────────────────────────────

type FormErrors = {
  name?: string;
  description?: string;
  quantity?: string;
  price?: string;
  category?: string;
  image?: string;
};

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Accessories",
  "Home",
  "Other",
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function validateForm(fields: {
  name: string;
  description: string;
  quantity: string;
  price: string;
  category: string;
  image: File | null;
}): FormErrors {
  const errors: FormErrors = {};

  if (!fields.name.trim()) {
    errors.name = "Product name is required.";
  }

  if (!fields.description.trim()) {
    errors.description = "Description is required.";
  }

  if (!fields.quantity) {
    errors.quantity = "Quantity is required.";
  } else if (Number(fields.quantity) < 0) {
    errors.quantity = "Quantity cannot be negative.";
  }

  if (!fields.price) {
    errors.price = "Price is required.";
  } else if (Number(fields.price) < 0) {
    errors.price = "Price cannot be negative.";
  }

  if (!fields.category) {
    errors.category = "Please select a category.";
  }

  if (!fields.image) {
    errors.image = "Product image is required.";
  }

  return errors;
}

// ── Field Error ───────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mt-1 text-[13px] font-normal text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200"
    >
      {message}
    </p>
  );
}

// ── Success Banner ────────────────────────────────────────────────────────────

function SuccessMessage({ onAddAnother }: { onAddAnother: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 animate-in fade-in-0 zoom-in-95 duration-300">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
        <CheckCircle2 className="size-8" />
      </div>
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-semibold tracking-tight">
          Product added successfully!
        </h2>
        <p className="text-sm text-muted-foreground">
          Your product has been added to the catalog.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/products">View Products</Link>
        </Button>
        <Button onClick={onAddAnother}>Add Another Product</Button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AddProductPage() {
  // Form state
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [image, setImage] = React.useState<File | null>(null);

  // UI state
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [categoryOptions, setCategoryOptions] = React.useState<string[]>([
    ...CATEGORIES,
  ]);

  React.useEffect(() => {
    fetch("/api/categories", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) {
          const names = json.data.map((c: { name: string }) => c.name);
          setCategoryOptions(Array.from(new Set([...CATEGORIES, ...names])));
        }
      })
      .catch(() => {});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  const resetForm = () => {
    setName("");
    setDescription("");
    setQuantity("");
    setPrice("");
    setCategory("");
    setImage(null);
    setErrors({});
    setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm({
      name,
      description,
      quantity,
      price,
      category,
      image,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const categoryLabel = categoryOptions.find(
        (c) => c.toLowerCase() === category,
      );
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          quantity: Number(quantity),
          category: categoryLabel ?? category,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message ?? "Failed to create product");
      }
      setIsSuccess(true);
    } catch (err) {
      setErrors({
        name: err instanceof Error ? err.message : "Failed to create product",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear field error on change
  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {isSuccess ? (
        <SuccessMessage onAddAnother={resetForm} />
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* ── Left Column: Product Details ──────────────────────────── */}
            <div className="space-y-6">
              {/* General Information */}
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                  <CardDescription>
                    Basic details about the product.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Product Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="productName">
                      Product Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="productName"
                      placeholder="Enter product name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearError("name");
                      }}
                      aria-invalid={!!errors.name}
                      disabled={isSubmitting}
                    />
                    <FieldError message={errors.name} />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="productDescription">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="productDescription"
                      placeholder="Enter product description"
                      rows={5}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        clearError("description");
                      }}
                      aria-invalid={!!errors.description}
                      disabled={isSubmitting}
                    />
                    <FieldError message={errors.description} />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Stock */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing &amp; Stock</CardTitle>
                  <CardDescription>
                    Set the price and available quantity.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Price */}
                    <div className="space-y-1.5">
                      <Label htmlFor="productPrice">
                        Price ($) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="productPrice"
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => {
                          setPrice(e.target.value);
                          clearError("price");
                        }}
                        aria-invalid={!!errors.price}
                        disabled={isSubmitting}
                      />
                      <FieldError message={errors.price} />
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1.5">
                      <Label htmlFor="productQuantity">
                        Quantity <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="productQuantity"
                        type="number"
                        min={0}
                        placeholder="0"
                        value={quantity}
                        onChange={(e) => {
                          setQuantity(e.target.value);
                          clearError("quantity");
                        }}
                        aria-invalid={!!errors.quantity}
                        disabled={isSubmitting}
                      />
                      <FieldError message={errors.quantity} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Right Column: Category & Image ───────────────────────── */}
            <div className="space-y-6">
              {/* Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Category</CardTitle>
                  <CardDescription>
                    Organize this product into a category.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    <Label htmlFor="productCategory">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={category}
                      onValueChange={(val) => {
                        setCategory(val);
                        clearError("category");
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        id="productCategory"
                        className="w-full"
                        aria-invalid={!!errors.category}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((cat) => (
                          <SelectItem key={cat} value={cat.toLowerCase()}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.category} />
                  </div>
                </CardContent>
              </Card>

              {/* Product Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Image</CardTitle>
                  <CardDescription>
                    Upload a high-quality image of the product.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    <Label htmlFor="productImage">
                      Image <span className="text-destructive">*</span>
                    </Label>
                    <ImageUpload
                      id="productImage"
                      value={image}
                      onChange={(file) => {
                        setImage(file);
                        clearError("image");
                      }}
                      aria-invalid={!!errors.image}
                      disabled={isSubmitting}
                    />
                    <FieldError message={errors.image} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Actions ─────────────────────────────────────────────── */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              asChild
            >
              <Link href="/products">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <Package className="size-4" />
                  Add Product
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
