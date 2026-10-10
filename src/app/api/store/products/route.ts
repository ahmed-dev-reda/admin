import { NextRequest } from "next/server";
import { handleError, parseWith, successWithPagination, success } from "@/lib/api";
import { productQuerySchema } from "@/lib/validations";
import { listProducts, getProduct } from "@/lib/services/product.service";

export async function GET(request: NextRequest) {
  try {
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
