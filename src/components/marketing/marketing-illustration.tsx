"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

type MarketingIllustrationProps = {
  webm: string;
  poster: string;
  label: string;
  className?: string;
  /** When true, video fills the container edge-to-edge. */
  cover?: boolean;
};

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function MarketingIllustration({
  webm,
  poster,
  label,
  className,
  cover = true,
}: MarketingIllustrationProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white",
        className,
      )}
      aria-hidden={label ? undefined : true}
    >
      {reducedMotion ? (
        <Image
          src={poster}
          alt=""
          fill
          sizes="(max-width: 768px) 120px, 160px"
          className={cn(cover ? "object-cover" : "object-contain p-3")}
        />
      ) : (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={poster}
          aria-label={label}
          className={cn(
            "h-full w-full",
            cover ? "object-cover" : "object-contain p-3",
          )}
        >
          <source src={webm} type="video/webm" />
        </video>
      )}
    </div>
  );
}
