"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LiquidGlass } from "./liquid-glass";

type GlassCardProps = React.ComponentProps<typeof Card>;

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <LiquidGlass
      variant="card"
      as={Card}
      className={cn("bg-transparent shadow-none ring-0", className)}
      contentClassName="flex flex-col gap-[inherit]"
      {...props}
    >
      {children}
    </LiquidGlass>
  );
}
