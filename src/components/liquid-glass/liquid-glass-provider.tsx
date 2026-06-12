"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadLiquidGL } from "@/lib/liquid-glass/load";
import {
  LIQUID_GLASS_PRESETS,
  LIQUID_GLASS_SNAPSHOT,
  LIQUID_GLASS_TARGET,
} from "@/lib/liquid-glass/presets";
import type { LiquidGlassApi, LiquidGlassPreset } from "@/lib/liquid-glass/types";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { LiquidGlassContext } from "./liquid-glass-context";

const PRESET_ORDER: LiquidGlassPreset[] = ["nav", "panel", "card"];

type LiquidGlassProviderProps = {
  children: React.ReactNode;
  className?: string;
};

export function LiquidGlassProvider({ children, className }: LiquidGlassProviderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const snapshotRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const apiRef = useRef<LiquidGlassApi | null>(null);
  const pendingDynamicRef = useRef<Array<string | Element | Element[]>>([]);

  const flushDynamic = useCallback((api: LiquidGlassApi) => {
    if (!pendingDynamicRef.current.length) return;
    for (const entry of pendingDynamicRef.current) {
      api.registerDynamic(entry);
    }
    pendingDynamicRef.current = [];
  }, []);

  const registerDynamic = useCallback(
    (elements: string | Element | Element[]) => {
      const api = apiRef.current;
      if (api && ready) {
        api.registerDynamic(elements);
        return;
      }
      pendingDynamicRef.current.push(elements);
    },
    [ready],
  );

  useEffect(() => {
    if (reducedMotion) {
      setReady(false);
      apiRef.current = null;
      document.body.removeAttribute("data-liquid-glass");
      return;
    }

    let cancelled = false;

    const waitForSnapshotLayout = async (el: HTMLElement, attempts = 12) => {
      for (let i = 0; i < attempts; i += 1) {
        const { width, height } = el.getBoundingClientRect();
        if (width > 0 && height > 0) return true;
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
      return false;
    };

    const init = async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      if (cancelled || !snapshotRef.current) return;

      const snapshotEl = snapshotRef.current;
      const hasTargets = PRESET_ORDER.some((preset) =>
        snapshotEl.querySelector(LIQUID_GLASS_TARGET[preset]),
      );
      if (!hasTargets) return;

      await waitForSnapshotLayout(snapshotEl);

      try {
        const api = await loadLiquidGL();
        if (cancelled) return;

        apiRef.current = api;

        const isMobile =
          window.matchMedia("(max-width: 768px)").matches ||
          window.matchMedia("(pointer: coarse)").matches;
        const resolution = Number(isMobile ? 1.35 : 1.85);

        let initialized = false;

        for (const preset of PRESET_ORDER) {
          const target = LIQUID_GLASS_TARGET[preset];
          if (!snapshotRef.current.querySelector(target)) continue;

          api({
            snapshot: LIQUID_GLASS_SNAPSHOT,
            target,
            resolution,
            ...LIQUID_GLASS_PRESETS[preset],
            on: {
              init() {
                if (initialized || cancelled) return;
                initialized = true;
                document.body.dataset.liquidGlass = "ready";
                setReady(true);
                flushDynamic(api);
              },
            },
          });
        }

        api.syncWith();
        flushDynamic(api);
      } catch (error) {
        console.warn("liquidGL failed to initialize — using CSS glass fallback.", error);
      }
    };

    void init();

    return () => {
      cancelled = true;
      apiRef.current = null;
      setReady(false);
      document.body.removeAttribute("data-liquid-glass");
      delete window.__liquidGLRenderer__;
    };
  }, [reducedMotion, flushDynamic]);

  const value = useMemo(
    () => ({
      ready,
      api: apiRef.current,
      registerDynamic,
    }),
    [ready, registerDynamic],
  );

  return (
    <LiquidGlassContext.Provider value={value}>
      <div ref={snapshotRef} data-liquid-snapshot className={className}>
        {children}
      </div>
    </LiquidGlassContext.Provider>
  );
}
