"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LiquidGlassPreset } from "@/lib/liquid-glass/types";

const VARIANT_CLASS: Record<LiquidGlassPreset, string> = {
  nav: "liquidGL-nav glass-nav",
  panel: "liquidGL-panel glass-panel",
  card: "liquidGL-card glass-card",
};

type LiquidGlassProps<T extends ElementType = "div"> = {
  as?: T;
  variant?: LiquidGlassPreset;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function LiquidGlass<T extends ElementType = "div">({
  as,
  variant = "panel",
  className,
  contentClassName,
  children,
  ...props
}: LiquidGlassProps<T>) {
  const Component = (as ?? "div") as ElementType;

  return (
    <Component className={cn("liquidGL-root relative", className)} {...props}>
      {/* Lens target only — liquidGL sets opacity:0 on this node during init */}
      <div
        className={cn("liquidGL pointer-events-none absolute inset-0", VARIANT_CLASS[variant])}
        aria-hidden
      />
      <div className={cn("liquid-glass-content relative w-full", contentClassName)}>{children}</div>
    </Component>
  );
}
