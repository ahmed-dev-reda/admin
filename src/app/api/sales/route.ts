import { NextRequest } from "next/server";
import { handleError, parseWith, successWithPagination, success, requirePermission, requireUser } from "@/lib/api";
import { saleQuerySchema, createSaleSchema } from "@/lib/validations";
import { listSales, createSale } from "@/lib/services/sale.service";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("sales");
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = parseWith(saleQuerySchema, params);
    const result = await listSales(query);
    return successWithPagination(result.sales, {
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
    const user = await requirePermission("sales");
    const body = await request.json().catch(() => null);
    const input = parseWith(createSaleSchema, body);
    const sale = await createSale({ ...input, userId: user.id });
    return success(sale, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
