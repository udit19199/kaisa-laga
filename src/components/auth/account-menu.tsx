"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { LogOutIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type AccountMenuProps = {
  variant?: "marketing" | "dashboard";
  align?: "start" | "center" | "end";
};

function initials(name: string | null | undefined, email: string | null | undefined) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }

  return email?.[0]?.toUpperCase() ?? "?";
}

export function AccountMenu({
  variant = "marketing",
  align = "end",
}: AccountMenuProps) {
  const { user } = useUser();
  const { signOut } = useClerk();

  const email = user?.primaryEmailAddress?.emailAddress;
  const name = user?.fullName ?? email ?? "Account";
  const avatarLabel = initials(user?.fullName, email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-3 rounded-full border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          variant === "dashboard" && "w-full justify-start",
        )}
        aria-label="Open account menu"
      >
        <span
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-medium",
            variant === "marketing"
              ? "bg-marketing-ink text-white"
              : "bg-sidebar-accent text-sidebar-accent-foreground",
          )}
        >
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt=""
              width={40}
              height={40}
              className="size-full rounded-full object-cover"
            />
          ) : (
            avatarLabel
          )}
        </span>
        {variant === "dashboard" ? (
          <span className="min-w-0 text-left">
            <span className="block truncate text-sm font-semibold">{name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {email}
            </span>
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{name}</span>
              {email ? (
                <span className="text-xs text-muted-foreground">{email}</span>
              ) : null}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ redirectUrl: "/" })}
        >
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
