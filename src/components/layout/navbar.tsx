import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Settings, User } from "lucide-react";
import { ModeToggle } from "./theme-toggle";
import { LogoutMenuItem } from "@/components/general/logout-menu-item";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email || "U";
  const parts = source.split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : source.slice(0, 2).toUpperCase();
}

export default async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  return (
    <nav className="p-4 flex items-center justify-between w-full">
      {/* LEFT  */}
      <h2>Admin Panel</h2>
      <div className="flex items-center gap-4">
        <Link href={"/"}>Dashboard</Link>
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-9 h-9 cursor-pointer">
              {user?.image && <AvatarImage src={user.image} />}
              <AvatarFallback>{initials(user?.name, user?.email)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={20}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.name ?? "Guest"}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {user?.email ?? ""}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem>
                <User /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings /> Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <LogoutMenuItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
