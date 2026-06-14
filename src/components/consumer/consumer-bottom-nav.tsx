"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { consumerTabs, isConsumerTabActive } from "@/components/consumer/consumer-nav";
import { cn } from "@/lib/utils";

export function ConsumerBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-marketing-line bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] font-marketing-ui lg:hidden"
      aria-label="Consumer navigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-2">
        {consumerTabs.map(({ href, label, icon: Icon }) => {
          const active = isConsumerTabActive(pathname, href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium no-underline transition-colors",
                  active
                    ? "text-marketing-accent"
                    : "text-marketing-muted hover:text-marketing-ink",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
