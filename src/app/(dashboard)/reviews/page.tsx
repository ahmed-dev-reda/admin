"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";

export default function ReviewsPage() {
  return (
    <section className="space-y-6 pb-8 pt-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Customer reviews and ratings
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
        <div className="rounded-full bg-muted p-4">
          <Star className="size-8 text-muted-foreground" />
        </div>
        <p className="font-medium">No reviews yet</p>
        <p className="text-sm text-muted-foreground">
          Customer reviews will appear here once they start reviewing products.
        </p>
      </div>
    </section>
  );
}
