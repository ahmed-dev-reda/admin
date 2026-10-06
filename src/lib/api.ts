import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ApiError, isApiError } from "@/lib/errors";

export function success<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function successWithPagination<T>(
  data: T[],
  pagination: { page: number; limit: number; total: number; totalPages: number },
) {
  return NextResponse.json({ success: true, data, pagination });
}

export function failure(
  status: number,
  code: string,
  message: string,
) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status },
  );
}

export function handleError(error: unknown) {
  if (isApiError(error)) {
    return failure(error.status, error.code, error.message);
  }
  if (error instanceof ZodError) {
    const message = error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    return failure(422, "VALIDATION_ERROR", message);
  }
  console.error("Unhandled API error:", error);
  return failure(500, "INTERNAL_ERROR", "Something went wrong");
}

/** Parses and validates data with a Zod schema. Throws ApiError on failure. */
export function parseWith<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new ApiError(422, "VALIDATION_ERROR", message);
  }
  return result.data;
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) return null;
  const user = session.user as unknown as SessionUser;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: typeof user.role === "string" ? user.role : "EMPLOYEE",
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
  return user;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ["products", "inventory", "sales", "customers", "reports", "users"],
  MANAGER: ["products", "inventory", "sales", "customers", "reports"],
  EMPLOYEE: ["products", "sales"],
};

export function can(role: string, permission: string): boolean {
  return (ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.EMPLOYEE).includes(permission);
}

export async function requirePermission(permission: string): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user.role, permission)) {
    throw new ApiError(403, "FORBIDDEN", "You do not have access to this resource");
  }
  return user;
}
