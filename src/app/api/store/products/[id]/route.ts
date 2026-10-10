import { NextRequest } from "next/server";
import { handleError, success } from "@/lib/api";
import { getProduct } from "@/lib/services/product.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const product = await getProduct(id);
    return success(product);
  } catch (error) {
    return handleError(error);
  }
}
