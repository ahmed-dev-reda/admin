import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

// ── Not Found ─────────────────────────────────────────────────────────────────

export default function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4 w-full">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="space-y-2">
          <SearchX className="mx-auto size-10 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">
            404 — Page not found
          </h1>
          <p className="text-sm text-muted-foreground">
            Sorry, the page you are looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/">Back to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

