import type { LiquidGlassApi } from "./types";

let loadPromise: Promise<LiquidGlassApi> | null = null;

/** Attach html2canvas + liquidGL to `window` (browser-only). */
export function loadLiquidGL(): Promise<LiquidGlassApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("liquidGL is browser-only"));
  }

  if (window.liquidGL) {
    return Promise.resolve(window.liquidGL);
  }

  if (!loadPromise) {
    loadPromise = (async () => {
      if (!window.html2canvas) {
        // html2canvas-pro supports lab/oklch — required for Tailwind v4 / oklch tokens
        const { default: html2canvas } = await import("html2canvas-pro");
        window.html2canvas = html2canvas;
      }

      await new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
          'script[data-liquid-gl="true"]',
        );
        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener("error", () => reject(new Error("liquidGL script failed")), {
            once: true,
          });
          return;
        }

        const script = document.createElement("script");
        script.src = "/scripts/liquidGL.js";
        script.defer = true;
        script.dataset.liquidGl = "true";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("liquidGL script failed"));
        document.body.appendChild(script);
      });

      if (!window.liquidGL) {
        throw new Error("liquidGL did not attach to window");
      }

      return window.liquidGL;
    })();
  }

  return loadPromise;
}
