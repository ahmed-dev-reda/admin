import { NextRequest } from "next/server";
import { handleError, parseWith, successWithPagination, success, requirePermission } from "@/lib/api";
import { productQuerySchema, createProductSchema } from "@/lib/validations";
import { listProducts, createProduct } from "@/lib/services/product.service";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("products");
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = parseWith(productQuerySchema, params);
    const result = await listProducts(query);
    return successWithPagination(result.products, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("products");
    const body = await request.json().catch(() => null);
    const input = parseWith(createProductSchema, body);
    const product = await createProduct(input);
    return success(product, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
