import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { productStatus, serializeProduct } from "@/lib/serializers";
import type { Prisma } from "@/generated/prisma/client";

type ProductListQuery = {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder: "asc" | "desc";
};

function productWhere(query: ProductListQuery): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.category) {
    where.category = { name: { equals: query.category, mode: "insensitive" } };
  }
  // status filter maps to quantity ranges
  if (query.status) {
    const s = query.status.toLowerCase();
    if (s === "in stock" || s === "instock") where.quantity = { gte: 10 };
    else if (s === "low stock" || s === "lowstock") where.quantity = { gt: 0, lt: 10 };
    else if (s === "out of stock" || s === "outofstock") where.quantity = { lte: 0 };
  }
  return where;
}

export async function listProducts(query: ProductListQuery) {
  const where = productWhere(query);
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    query.sortBy === "price"
      ? { price: query.sortOrder }
      : query.sortBy === "quantity"
        ? { quantity: query.sortOrder }
        : query.sortBy === "name"
          ? { name: query.sortOrder }
          : { createdAt: query.sortOrder };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return {
    products: products.map(serializeProduct),
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) throw new ApiError(404, "NOT_FOUND", "Product not found");
  return serializeProduct(product);
}

async function resolveCategoryId(input: { categoryId?: string; category?: string }) {
  if (input.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) throw new ApiError(422, "VALIDATION_ERROR", "Invalid category");
    return category.id;
  }
  if (input.category) {
    const category = await prisma.category.upsert({
      where: { name: input.category },
      update: {},
      create: { name: input.category },
    });
    return category.id;
  }
  throw new ApiError(422, "VALIDATION_ERROR", "Category is required");
}

export async function createProduct(input: {
  name: string;
  description: string;
  price: number;
  quantity: number;
  categoryId?: string;
  category?: string;
  imageUrl?: string | null;
}) {
  const categoryId = await resolveCategoryId(input);
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: input.name,
        description: input.description,
        price: input.price,
        quantity: input.quantity,
        imageUrl: input.imageUrl ?? null,
        categoryId,
      },
      include: { category: true },
    });
    if (input.quantity > 0) {
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          type: "IN",
          quantity: input.quantity,
          reason: "Initial stock",
        },
      });
    }
    return serializeProduct(product);
  });
}

export async function updateProduct(
  id: string,
  input: Partial<{
    name: string;
    description: string;
    price: number;
    quantity: number;
    categoryId?: string;
    category?: string;
    imageUrl?: string | null;
  }>,
) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Product not found");

  const data: Prisma.ProductUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;
  if (input.price !== undefined) data.price = input.price;
  if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl;
  if (input.categoryId !== undefined || input.category !== undefined) {
    data.category = { connect: { id: await resolveCategoryId(input) } };
  }

  return prisma.$transaction(async (tx) => {
    if (input.quantity !== undefined && input.quantity !== existing.quantity) {
      const delta = input.quantity - existing.quantity;
      if (delta < 0 && existing.quantity + delta < 0) {
        throw new ApiError(409, "CONFLICT", "Stock cannot become negative");
      }
      data.quantity = input.quantity;
      await tx.stockMovement.create({
        data: {
          productId: id,
          type: "ADJUSTMENT",
          quantity: Math.abs(delta),
          reason: "Manual adjustment",
        },
      });
    }
    const product = await tx.product.update({
      where: { id },
      data,
      include: { category: true },
    });
    return serializeProduct(product);
  });
}

export async function deleteProduct(id: string) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Product not found");
  const saleItems = await prisma.saleItem.count({ where: { productId: id } });
  if (saleItems > 0) {
    throw new ApiError(409, "CONFLICT", "Product has sales and cannot be deleted");
  }
  await prisma.product.delete({ where: { id } });
  return { id };
}

export async function listCategories() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return categories.map((c) => ({ id: c.id, name: c.name }));
}

// kept for API compatibility
export { productStatus };
