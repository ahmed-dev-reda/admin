import { NextRequest } from "next/server";
import { handleError, parseWith, success, requirePermission } from "@/lib/api";
import { listCategories } from "@/lib/services/product.service";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  try {
    await requirePermission("products");
    const categories = await listCategories();
    return success(categories);
  } catch (error) {
    return handleError(error);
  }
}

const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});

export async function POST(request: NextRequest) {
  try {
    await requirePermission("products");
    const body = await request.json().catch(() => null);
    const input = parseWith(createCategorySchema, body);
    const existing = await prisma.category.findUnique({
      where: { name: input.name },
    });
    if (existing) {
      return success({ id: existing.id, name: existing.name }, { status: 200 });
    }
    const category = await prisma.category.create({
      data: { name: input.name },
    });
    return success({ id: category.id, name: category.name }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
