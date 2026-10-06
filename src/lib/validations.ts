import { z } from "zod";

export const SALE_STATUSES = ["PENDING", "PROCESSING", "DELIVERED", "CANCELLED"] as const;
export const STOCK_TYPES = ["IN", "OUT", "ADJUSTMENT"] as const;

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const productQuerySchema = paginationQuery.extend({
  category: z.string().trim().optional(),
  status: z.string().trim().optional(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(5000),
  price: z.coerce.number().nonnegative("Price cannot be negative").max(1_000_000),
  quantity: z.coerce.number().int().nonnegative("Quantity cannot be negative"),
  categoryId: z.string().min(1, "Category is required").optional(),
  category: z.string().trim().min(1).optional(), // category name fallback
  imageUrl: z.string().url().optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

export const customerQuerySchema = paginationQuery;

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Invalid email"),
  phone: z.string().trim().max(50).optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const saleQuerySchema = paginationQuery.extend({
  status: z.enum(SALE_STATUSES).optional(),
  customerId: z.string().optional(),
  customer: z.string().trim().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const createSaleSchema = z.object({
  customerId: z.string().optional().nullable(),
  customerEmail: z.string().trim().email().optional(),
  customerName: z.string().trim().min(1).optional(),
  status: z.enum(SALE_STATUSES).default("PENDING"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "At least one item is required"),
});

export const stockMovementSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(STOCK_TYPES),
  quantity: z.coerce.number().int().min(1),
  reason: z.string().trim().max(500).optional(),
});
