"use client";

import { LiquidGlassProvider } from "@/components/liquid-glass";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return <LiquidGlassProvider className="brand-surface min-h-dvh">{children}</LiquidGlassProvider>;
}
