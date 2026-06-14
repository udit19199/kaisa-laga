"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KaisaLagaMark } from "@/components/consumer/consumer-chrome";
import { consumerTabs, isConsumerTabActive } from "@/components/consumer/consumer-nav";
import { cn } from "@/lib/utils";

export function ConsumerSideNav() {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 hidden h-dvh w-[240px] shrink-0 flex-col border-r border-marketing-line bg-white px-5 py-8 font-marketing-ui lg:flex xl:w-[260px]"
      aria-label="Consumer navigation"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-3 font-marketing-display text-[26px] leading-none text-marketing-ink no-underline"
        aria-label="Kaisa Laga home"
      >
        <KaisaLagaMark className="scale-[0.8] origin-left" />
        <span>Kaisa Laga</span>
      </Link>

      <nav className="mt-10 flex flex-1 flex-col gap-1">
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {consumerTabs.map(({ href, label, icon: Icon }) => {
            const active = isConsumerTabActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium no-underline transition-colors",
                    active
                      ? "bg-marketing-card text-marketing-accent"
                      : "text-marketing-muted hover:bg-marketing-card/60 hover:text-marketing-ink",
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

      <Link
        href="/sign-up"
        className="text-sm text-marketing-muted no-underline transition-colors hover:text-marketing-ink"
      >
        For business
      </Link>
    </aside>
  );
}
