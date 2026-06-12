"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LiquidGlass } from "@/components/liquid-glass";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Inbox" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/locations", label: "Locations" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <LiquidGlass as="header" variant="nav" className="sticky top-0 border-b-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="text-lg font-semibold">
            Pulse Drop
          </Link>
          <UserButton />
        </div>
        <nav className="-mx-1 flex gap-1 overflow-x-auto pb-0.5 sm:mx-0 sm:pb-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </LiquidGlass>
  );
}
