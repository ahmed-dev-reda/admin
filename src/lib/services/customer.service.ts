import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { serializeCustomer } from "@/lib/serializers";
import type { Prisma } from "@/generated/prisma/client";

type ListQuery = {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder: "asc" | "desc";
};

export async function listCustomers(query: ListQuery) {
  const where: Prisma.CustomerWhereInput = query.search
    ? {
        OR: [
          { name: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
        ],
      }
    : {};
  const orderBy: Prisma.CustomerOrderByWithRelationInput =
    query.sortBy === "name"
      ? { name: query.sortOrder }
      : query.sortBy === "email"
        ? { email: query.sortOrder }
        : { createdAt: query.sortOrder };

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return {
    customers: customers.map(serializeCustomer),
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function getCustomer(id: string) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw new ApiError(404, "NOT_FOUND", "Customer not found");
  return serializeCustomer(customer);
}

export async function createCustomer(input: {
  name: string;
  email: string;
  phone?: string | null;
}) {
  const existing = await prisma.customer.findUnique({ where: { email: input.email } });
  if (existing) throw new ApiError(409, "CONFLICT", "Email already in use");
  const customer = await prisma.customer.create({ data: input });
  return serializeCustomer(customer);
}

export async function updateCustomer(
  id: string,
  input: Partial<{ name: string; email: string; phone: string | null }>,
) {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Customer not found");
  const customer = await prisma.customer.update({ where: { id }, data: input });
  return serializeCustomer(customer);
}

export async function deleteCustomer(id: string) {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Customer not found");
  await prisma.customer.delete({ where: { id } });
  return { id };
}
