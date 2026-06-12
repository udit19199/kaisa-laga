"use client";

import { useEffect, useRef } from "react";
import { useLiquidGlass } from "@/components/liquid-glass";

/** Register animated regions with liquidGL once the provider is ready. */
export function useLiquidGlassDynamic(
  selector: string,
  deps: ReadonlyArray<unknown> = [],
) {
  const { registerDynamic, ready } = useLiquidGlass();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!ready || registeredRef.current) return;
    registerDynamic(selector);
    registeredRef.current = true;
  }, [ready, registerDynamic, selector, ...deps]);
}
