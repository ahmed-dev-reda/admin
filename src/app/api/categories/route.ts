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

const updateCategorySchema = z.object({
  id: z.string().min(1, "ID is required"),
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

export async function PATCH(request: NextRequest) {
  try {
    await requirePermission("products");
    const body = await request.json().catch(() => null);
    const input = parseWith(updateCategorySchema, body);
    const category = await prisma.category.update({
      where: { id: input.id },
      data: { name: input.name },
    });
    return success({ id: category.id, name: category.name });
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
      return handleError(new Error("Category ID is required"));
    }
    await prisma.category.delete({ where: { id } });
    return success({ id });
  } catch (error) {
    return handleError(error);
  }
}
