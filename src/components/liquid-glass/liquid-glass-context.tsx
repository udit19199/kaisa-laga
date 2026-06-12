"use client";

import { createContext, use } from "react";
import type { LiquidGlassApi } from "@/lib/liquid-glass/types";

type LiquidGlassContextValue = {
  ready: boolean;
  api: LiquidGlassApi | null;
  registerDynamic: (elements: string | Element | Element[]) => void;
};

export const LiquidGlassContext = createContext<LiquidGlassContextValue>({
  ready: false,
  api: null,
  registerDynamic: () => {},
});

export function useLiquidGlass() {
  return use(LiquidGlassContext);
}
