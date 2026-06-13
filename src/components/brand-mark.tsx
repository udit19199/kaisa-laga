"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  imageClassName,
  priority = false,
}: {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2xl border border-[var(--brand-ink)]/10 bg-[var(--brand-paper)]/80 shadow-sm",
        className,
      )}
    >
      <Image
        src="/brand/auris-icon.png"
        alt=""
        width={1024}
        height={1024}
        aria-hidden
        className={cn("h-6 w-6 object-contain", imageClassName)}
        priority={priority}
      />
    </span>
  );
}
