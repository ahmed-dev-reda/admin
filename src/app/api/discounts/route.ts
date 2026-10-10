import { NextRequest } from "next/server";
import { handleError, success, requirePermission } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requirePermission("products");
    const discounts = await prisma.discount.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        code: true,
        description: true,
        amount: true,
        type: true,
        active: true,
        expiresAt: true,
        createdAt: true,
      },
    });
    return success(discounts);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requirePermission("products");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return handleError(new Error("Discount ID is required"));
    }
    await prisma.discount.delete({ where: { id } });
    return success({ id });
  } catch (error) {
    return handleError(error);
  }
}
