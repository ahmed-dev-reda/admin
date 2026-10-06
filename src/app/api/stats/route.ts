import { handleError, success, requirePermission } from "@/lib/api";
import { getDashboardStats } from "@/lib/services/stats.service";

export async function GET() {
  try {
    await requirePermission("reports");
    const stats = await getDashboardStats();
    return success(stats);
  } catch (error) {
    return handleError(error);
  }
}
