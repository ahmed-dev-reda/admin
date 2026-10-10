"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/customers?limit=100", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json?.error?.message ?? "Failed to load customers");
        }
        setCustomers(json.data);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load customers"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="space-y-6 pb-8 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your customer base
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading customers…</p>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <Users className="size-8 text-muted-foreground" />
          </div>
          <p className="font-medium">No customers yet</p>
          <p className="text-sm text-muted-foreground">
            Customers will appear here once they start purchasing.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="pr-6">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} className="group">
                <TableCell className="pl-6 font-medium">
                  {customer.name}
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone ?? "—"}</TableCell>
                <TableCell className="pr-6 text-muted-foreground">
                  {new Date(customer.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
