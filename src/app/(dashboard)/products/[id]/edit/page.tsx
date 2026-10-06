import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";
import EditProductForm from "@/components/general/edit-product-form";

export default async function EditProduct({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  const { id } = await params;

  const record = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!record) notFound();

  const product = serializeProduct(record);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-semibold">Edit Product</h1>
          <p className="text-sm text-muted-foreground">
            Update product information
          </p>
        </div>
      </div>

      <EditProductForm
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          quantity: product.quantity,
          status: product.status,
        }}
      />
    </div>
  );
}
