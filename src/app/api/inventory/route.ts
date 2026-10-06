import { NextRequest } from "next/server";
import { handleError, parseWith, success, requirePermission } from "@/lib/api";
import { stockMovementSchema } from "@/lib/validations";
import { createStockMovement } from "@/lib/services/sale.service";

export async function POST(request: NextRequest) {
  try {
    await requirePermission("inventory");
    const body = await request.json().catch(() => null);
    const input = parseWith(stockMovementSchema, body);
    const movement = await createStockMovement(input);
    return success(movement, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
