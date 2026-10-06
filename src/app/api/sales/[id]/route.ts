import { NextRequest } from "next/server";
import { handleError, success, requirePermission } from "@/lib/api";
import { getSale } from "@/lib/services/sale.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  try {
    await requirePermission("sales");
    const { id } = await context.params;
    const sale = await getSale(id);
    return success(sale);
  } catch (error) {
    return handleError(error);
  }
}
