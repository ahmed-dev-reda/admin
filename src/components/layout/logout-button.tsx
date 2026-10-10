"use client";

import { Loader2, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useFormStatus } from "react-dom";

export function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={"destructive"}
      disabled={pending}
      className="cursor-pointer w-full"
    >
      {pending ? <Loader2 /> : <LogOut />}
      <span>Logout</span>
    </Button>
  );
}
