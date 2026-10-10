"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDiscountAction(prevState: unknown, formData: FormData) {
  try {
    const code = formData.get("code") as string;
    const description = formData.get("description") as string;
    const amountStr = formData.get("amount") as string;
    const type = formData.get("type") as string;
    const activeStr = formData.get("active") as string;
    const expiresAtStr = formData.get("expiresAt") as string;

    if (!code || !amountStr || !type) {
      return { success: false, error: "Missing required fields" };
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount < 0) {
      return { success: false, error: "Invalid amount" };
    }

    const active = activeStr === "on" || activeStr === "true";
    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;

    const existingDiscount = await prisma.discount.findUnique({
      where: { code },
    });

    if (existingDiscount) {
      return { success: false, error: "Discount code already exists" };
    }

    await prisma.discount.create({
      data: {
        code,
        description,
        amount,
        type,
        active,
        expiresAt,
      },
    });

    revalidatePath("/discounts");
    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to create discount:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
