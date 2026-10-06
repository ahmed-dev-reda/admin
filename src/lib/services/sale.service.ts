import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { serializeSale, serializeStockMovement } from "@/lib/serializers";
import type { Prisma } from "@/generated/prisma/client";

type ListQuery = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  customer?: string;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder: "asc" | "desc";
};

export async function listSales(query: ListQuery) {
  const where: Prisma.SaleWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.customerId) where.customerId = query.customerId;
  if (query.customer) {
    where.customer = {
      OR: [
        { name: { contains: query.customer, mode: "insensitive" } },
        { email: { contains: query.customer, mode: "insensitive" } },
      ],
    };
  }
  if (query.search) {
    where.OR = [
      { id: { contains: query.search, mode: "insensitive" } },
      { customer: { name: { contains: query.search, mode: "insensitive" } } },
    ];
  }
  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};
    if (query.dateFrom) where.createdAt.gte = query.dateFrom;
    if (query.dateTo) where.createdAt.lte = query.dateTo;
  }

  const orderBy: Prisma.SaleOrderByWithRelationInput =
    query.sortBy === "total"
      ? { total: query.sortOrder }
      : query.sortBy === "status"
        ? { status: query.sortOrder }
        : { createdAt: query.sortOrder };

  const [total, sales] = await Promise.all([
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      include: { customer: true, items: { include: { product: true } } },
      orderBy,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return {
    sales: sales.map(serializeSale),
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function getSale(id: string) {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { customer: true, items: { include: { product: true } } },
  });
  if (!sale) throw new ApiError(404, "NOT_FOUND", "Sale not found");
  return serializeSale(sale);
}

export async function createSale(input: {
  customerId?: string | null;
  customerEmail?: string;
  customerName?: string;
  status: string;
  items: { productId: string; quantity: number }[];
  userId: string;
}) {
  return prisma.$transaction(async (tx) => {
    // resolve customer
    let customerId = input.customerId ?? null;
    if (customerId) {
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      if (!customer) throw new ApiError(422, "VALIDATION_ERROR", "Invalid customer");
    } else if (input.customerEmail) {
      const customer = await tx.customer.upsert({
        where: { email: input.customerEmail },
        update: {},
        create: {
          email: input.customerEmail,
          name: input.customerName ?? input.customerEmail,
        },
      });
      customerId = customer.id;
    }

    // load products from database — never trust client prices
    const productIds = input.items.map((i) => i.productId);
    const products = await tx.product.findMany({ where: { id: { in: productIds } } });
    const byId = new Map(products.map((p) => [p.id, p]));

    let total = 0;
    const saleItemsData: {
      productId: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[] = [];

    for (const item of input.items) {
      const product = byId.get(item.productId);
      if (!product) {
        throw new ApiError(422, "VALIDATION_ERROR", `Unknown product: ${item.productId}`);
      }
      if (product.quantity < item.quantity) {
        throw new ApiError(
          409,
          "INSUFFICIENT_STOCK",
          `Insufficient stock for "${product.name}" (available: ${product.quantity})`,
        );
      }
      const unitPrice = Number(product.price);
      const subtotal = unitPrice * item.quantity;
      total += subtotal;
      saleItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    const sale = await tx.sale.create({
      data: {
        customerId,
        userId: input.userId,
        status: input.status,
        total,
        items: { create: saleItemsData },
      },
      include: { customer: true, items: { include: { product: true } } },
    });

    // decrement stock + record movements
    for (const item of input.items) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      });
      if (updated.count !== 1) {
        throw new ApiError(409, "INSUFFICIENT_STOCK", "Insufficient stock");
      }
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: "OUT",
          quantity: item.quantity,
          reason: `Sale ${sale.id}`,
        },
      });
    }

    return serializeSale(sale);
  });
}

export async function createStockMovement(input: {
  productId: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  reason?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: input.productId } });
    if (!product) throw new ApiError(404, "NOT_FOUND", "Product not found");

    let nextQuantity = product.quantity;
    if (input.type === "IN") nextQuantity += input.quantity;
    else if (input.type === "OUT") nextQuantity -= input.quantity;
    else nextQuantity = input.quantity; // ADJUSTMENT sets absolute

    if (nextQuantity < 0) {
      throw new ApiError(409, "INSUFFICIENT_STOCK", "Stock cannot become negative");
    }

    const updated = await tx.product.updateMany({
      where:
        input.type === "OUT"
          ? { id: input.productId, quantity: { gte: input.quantity } }
          : { id: input.productId },
      data: { quantity: nextQuantity },
    });
    if (updated.count !== 1) {
      throw new ApiError(409, "INSUFFICIENT_STOCK", "Insufficient stock");
    }

    const movement = await tx.stockMovement.create({
      data: {
        productId: input.productId,
        type: input.type,
        quantity: input.quantity,
        reason: input.reason ?? null,
      },
    });
    return serializeStockMovement(movement);
  });
}
