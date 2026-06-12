export type LiquidGlassPreset = "nav" | "panel" | "card";

export type LiquidGlassOptions = {
  target: string;
  snapshot?: string;
  resolution?: number;
  refraction?: number;
  bevelDepth?: number;
  bevelWidth?: number;
  frost?: number;
  shadow?: boolean;
  specular?: boolean;
  reveal?: "none" | "fade";
  tilt?: boolean;
  tiltFactor?: number;
  magnify?: number;
  on?: {
    init?: (instance: unknown) => void;
  };
};

export type LiquidGlassLens = {
  el: HTMLElement;
};

export type LiquidGlassApi = ((options: LiquidGlassOptions) => LiquidGlassLens | LiquidGlassLens[] | undefined) & {
  registerDynamic: (elements: string | Element | Element[]) => void;
  syncWith: (config?: Record<string, unknown>) => {
    lenis?: unknown;
    locomotiveScroll?: unknown;
  };
};

declare global {
  interface Window {
    html2canvas?: typeof import("html2canvas-pro").default;
    liquidGL?: LiquidGlassApi;
    __liquidGLRenderer__?: unknown;
  }
}
