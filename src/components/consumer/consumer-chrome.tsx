import Link from "next/link";
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

export function ConsumerHeader({
  title,
  showBrand = true,
}: {
  title?: string;
  showBrand?: boolean;
}) {
  if (showBrand) {
    return (
      <header className="border-b border-marketing-line lg:hidden">
        <div className="flex h-[72px] items-center justify-between px-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-marketing-display text-[22px] leading-none text-marketing-ink no-underline"
            aria-label="Kaisa Laga home"
          >
            <KaisaLagaMark className="scale-[0.72] origin-left" />
            <span>Kaisa Laga</span>
          </Link>
          <Link
            href="/sign-up"
            className="text-sm text-marketing-muted no-underline transition-colors hover:text-marketing-ink"
          >
            For business
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-marketing-line lg:sticky lg:top-0 lg:z-40 lg:bg-white/95 lg:backdrop-blur-sm">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center px-5 lg:h-[88px] lg:px-8">
        <h1 className="m-0 font-marketing-display text-[26px] font-normal text-marketing-ink lg:text-[36px]">
          {title}
        </h1>
      </div>
    </header>
  );
}
