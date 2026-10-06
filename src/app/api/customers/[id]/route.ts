import { NextRequest } from "next/server";
import { handleError, parseWith, success, requirePermission } from "@/lib/api";
import { updateCustomerSchema } from "@/lib/validations";
import { getCustomer, updateCustomer, deleteCustomer } from "@/lib/services/customer.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  try {
    await requirePermission("customers");
    const { id } = await context.params;
    const customer = await getCustomer(id);
    return success(customer);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requirePermission("customers");
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const input = parseWith(updateCustomerSchema, body);
    const customer = await updateCustomer(id, input);
    return success(customer);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  try {
    await requirePermission("customers");
    const { id } = await context.params;
    const result = await deleteCustomer(id);
    return success(result);
  } catch (error) {
    return handleError(error);
  }
}
