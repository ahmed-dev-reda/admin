import { handleError, success } from "@/lib/api";
import { listCategories } from "@/lib/services/product.service";

export async function GET() {
  try {
    const categories = await listCategories();
    return success(categories);
  } catch (error) {
    return handleError(error);
  }
}
