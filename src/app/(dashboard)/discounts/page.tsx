"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgePercent, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DiscountsPage() {
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

      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
        <div className="rounded-full bg-muted p-4">
          <BadgePercent className="size-8 text-muted-foreground" />
        </div>
        <p className="font-medium">No discounts yet</p>
        <p className="text-sm text-muted-foreground">
          Create discount codes to offer promotions to your customers.
        </p>
      </div>
    </section>
  );
}
