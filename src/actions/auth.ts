"use server";

import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Failed to sign out from auth api:", error);
  }

  const cookieStore = await cookies();
  const domain = process.env.AUTH_COOKIE_DOMAIN;
  cookieStore.delete("better-auth.session_token");
  cookieStore.delete("__Secure-better-auth.session_token");
  if (domain) {
    cookieStore.delete({
      name: "better-auth.session_token",
      domain,
    });
    cookieStore.delete({
      name: "__Secure-better-auth.session_token",
      domain,
    });
  }

  redirect("/auth/sign-in");
}