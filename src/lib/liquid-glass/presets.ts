import type { LiquidGlassOptions, LiquidGlassPreset } from "./types";

/** Shared lens settings per surface type — see liquidGL README presets. */
export const LIQUID_GLASS_PRESETS: Record<LiquidGlassPreset, Omit<LiquidGlassOptions, "target">> = {
  nav: {
    refraction: 0,
    bevelDepth: 0.052,
    bevelWidth: 0.211,
    frost: 2,
    shadow: true,
    specular: true,
    reveal: "fade",
    tilt: false,
    magnify: 1,
  },
  panel: {
    refraction: 0,
    bevelDepth: 0.035,
    bevelWidth: 0.119,
    frost: 0.9,
    shadow: true,
    specular: true,
    reveal: "fade",
    tilt: false,
    magnify: 1,
  },
  card: {
    refraction: 0,
    bevelDepth: 0.052,
    bevelWidth: 0.15,
    frost: 1.5,
    shadow: false,
    specular: false,
    reveal: "fade",
    tilt: false,
    magnify: 1,
  },
};

export const LIQUID_GLASS_TARGET = {
  nav: ".liquidGL-nav",
  panel: ".liquidGL-panel",
  card: ".liquidGL-card",
} as const satisfies Record<LiquidGlassPreset, string>;

export const LIQUID_GLASS_SNAPSHOT = "[data-liquid-snapshot]";
