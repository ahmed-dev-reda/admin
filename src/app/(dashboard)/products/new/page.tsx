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
import ProductForm from "@/components/general/product-form";

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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);
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
    <section className="space-y-6 pb-8 pt-2">
      <ProductForm />
    </section>
  );
}
