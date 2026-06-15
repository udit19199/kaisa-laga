"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { AccountMenu } from "@/components/auth/account-menu";
import { consumerTabs, isConsumerTabActive } from "@/components/consumer/consumer-nav";
import { DINER_SIGN_IN_PATH } from "@/lib/auth-routes";
import { cn } from "@/lib/utils";

export function KaisaLagaMark({ className }: { className?: string }) {
  const halfClass =
    "absolute top-0 h-[42px] w-[15px] overflow-hidden rounded-[6px_6px_7px_7px] bg-current";

  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-block h-[42px] w-[33px] shrink-0", className)}
    >
      <span
        className={cn(
          halfClass,
          "left-0 after:absolute after:-top-px after:-right-1.5 after:h-[22px] after:w-3 after:rounded-full after:bg-white after:content-['']",
        )}
      />
      <span
        className={cn(
          halfClass,
          "right-0 after:absolute after:-bottom-px after:-left-1.5 after:h-[22px] after:w-3 after:rounded-full after:bg-white after:content-['']",
        )}
      />
    </span>
  );
}

function ConsumerSegmentedNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:block" aria-label="Consumer navigation">
      <ul className="m-0 flex list-none gap-0 rounded-full bg-marketing-card p-1">
        {consumerTabs.map(({ href, label }) => {
          const active = isConsumerTabActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "inline-flex rounded-full px-3.5 py-2 text-[14px] font-medium no-underline transition-colors",
                  active
                    ? "bg-white text-marketing-ink shadow-[0_1px_2px_rgb(8_8_8/0.06)]"
                    : "text-marketing-muted hover:text-marketing-ink",
                )}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ConsumerHeaderAuth() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <AccountMenu align="end" />;
  }

  return (
    <Link
      href={DINER_SIGN_IN_PATH}
      className="text-sm font-medium text-marketing-muted no-underline transition-colors hover:text-marketing-ink"
    >
      Sign in
    </Link>
  );
}

function ConsumerHeaderActions({ isDiscoverHome }: { isDiscoverHome: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <div className="hidden lg:block">
        <ConsumerHeaderAuth />
      </div>
      <Link
        href="/sign-up"
        className={cn(
          "shrink-0 text-sm font-medium no-underline transition-colors",
          isDiscoverHome
            ? "rounded-full border border-marketing-line px-4 py-2 text-marketing-ink hover:bg-marketing-card"
            : "text-marketing-muted hover:text-marketing-ink",
        )}
      >
        For business
      </Link>
    </div>
  );
}

export function ConsumerHeader({
  title,
  showBrand = true,
}: {
  title?: string;
  showBrand?: boolean;
}) {
  const pathname = usePathname();
  const isDiscoverHome = showBrand && pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-marketing-line bg-white/90 backdrop-blur-sm">
      <div
        className={cn(
          "mx-auto flex h-[72px] max-w-6xl items-center px-5 lg:h-[76px] lg:px-8",
          isDiscoverHome ? "justify-between" : "gap-6",
        )}
      >
        {showBrand ? (
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2.5 font-marketing-display text-[22px] leading-none text-marketing-ink no-underline lg:text-[24px]"
            aria-label="Kaisa Laga home"
          >
            <KaisaLagaMark className="origin-left scale-[0.72] lg:scale-[0.76]" />
            <span>Kaisa Laga</span>
          </Link>
        ) : (
          <h1 className="m-0 shrink-0 font-marketing-display text-[26px] font-normal text-marketing-ink lg:text-[30px]">
            {title}
          </h1>
        )}

        {!isDiscoverHome ? (
          <div className="flex flex-1 justify-center">
            <ConsumerSegmentedNav />
          </div>
        ) : null}

        {showBrand ? (
          <ConsumerHeaderActions isDiscoverHome={isDiscoverHome} />
        ) : (
          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <ConsumerHeaderAuth />
          </div>
        )}
      </div>
    </header>
  );
}
