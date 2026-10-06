"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogOutIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function LogoutMenuItem() {
  const router = useRouter();
  return (
    <DropdownMenuItem
      variant="destructive"
      className="cursor-pointer"
      onClick={async () => {
        await authClient.signOut();
        router.push("/auth/sign-in");
        router.refresh();
      }}
    >
      <LogOutIcon />
      Logout
    </DropdownMenuItem>
  );
}
