import { NextRequest } from "next/server";
import { handleError, parseWith, successWithPagination, success, requirePermission } from "@/lib/api";
import { customerQuerySchema, createCustomerSchema } from "@/lib/validations";
import { listCustomers, createCustomer } from "@/lib/services/customer.service";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("customers");
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = parseWith(customerQuerySchema, params);
    const result = await listCustomers(query);
    return successWithPagination(result.customers, {
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
    await requirePermission("customers");
    const body = await request.json().catch(() => null);
    const input = parseWith(createCustomerSchema, body);
    const customer = await createCustomer(input);
    return success(customer, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
