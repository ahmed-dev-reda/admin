import { NextRequest } from "next/server";
import { handleError, parseWith, success, requirePermission } from "@/lib/api";
import { updateProductSchema } from "@/lib/validations";
import { getProduct, updateProduct, deleteProduct } from "@/lib/services/product.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  try {
    await requirePermission("products");
    const { id } = await context.params;
    const product = await getProduct(id);
    return success(product);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requirePermission("products");
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const input = parseWith(updateProductSchema, body);
    const product = await updateProduct(id, input);
    return success(product);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  try {
    await requirePermission("products");
    const { id } = await context.params;
    const result = await deleteProduct(id);
    return success(result);
  } catch (error) {
    return handleError(error);
  }
}
