"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type HTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export type WaveformProps = HTMLAttributes<HTMLDivElement> & {
  data?: number[];
  barWidth?: number;
  barHeight?: number;
  barGap?: number;
  barRadius?: number;
  barColor?: string;
  fadeEdges?: boolean;
  fadeWidth?: number;
  height?: string | number;
  onBarClick?: (index: number, value: number) => void;
};

type Bar = { x: number; height: number };

function resolveBarColor(canvas: HTMLCanvasElement, barColor?: string) {
  if (barColor === "gray") return "oklch(0.55 0.02 250)";
  if (barColor?.startsWith("var(")) {
    const varName = barColor.slice(4, -1).trim();
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (resolved) return resolved;
  }
  if (barColor) return barColor;
  return (
    getComputedStyle(canvas).getPropertyValue("color").trim() ||
    getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim() ||
    "#000"
  );
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  bars: Bar[],
  rect: DOMRect,
  opts: {
    barWidth: number;
    barGap: number;
    barRadius: number;
    baseBarHeight: number;
    barColor: string;
    fadeEdges: boolean;
    fadeWidth: number;
  },
) {
  const { barWidth, barGap, barRadius, baseBarHeight, barColor, fadeEdges, fadeWidth } = opts;
  const centerY = rect.height / 2;

  ctx.fillStyle = barColor;
  for (const bar of bars) {
    const barH = Math.max(baseBarHeight, bar.height * (rect.height - 8));
    const y = centerY - barH / 2;
    ctx.beginPath();
    ctx.roundRect(bar.x, y, barWidth, barH, barRadius);
    ctx.fill();
  }

  if (fadeEdges && fadeWidth > 0) {
    const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(fadeWidth / rect.width, "rgba(255,255,255,0)");
    gradient.addColorStop(1 - fadeWidth / rect.width, "rgba(255,255,255,0)");
    gradient.addColorStop(1, "rgba(255,255,255,1)");
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.globalCompositeOperation = "source-over";
  }
}

export function Waveform({
  data = [],
  barWidth = 4,
  barHeight: baseBarHeight = 4,
  barGap = 2,
  barRadius = 2,
  barColor,
  fadeEdges = true,
  fadeWidth = 24,
  height = 128,
  className,
  ...props
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heightStyle = typeof height === "number" ? `${height}px` : height;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const step = barWidth + barGap;
      const bars: Bar[] = data.map((value, i) => ({
        x: i * step,
        height: value,
      }));

      drawBars(ctx, bars, rect, {
        barWidth,
        barGap,
        barRadius,
        baseBarHeight,
        barColor: resolveBarColor(canvas, barColor),
        fadeEdges,
        fadeWidth,
      });
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [data, barWidth, barGap, barRadius, baseBarHeight, barColor, fadeEdges, fadeWidth]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height: heightStyle }}
      {...props}
    >
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  );
}

export type ScrollingWaveformProps = Omit<WaveformProps, "data" | "onBarClick"> & {
  speed?: number;
  barCount?: number;
};

export function ScrollingWaveform({
  speed = 50,
  barCount = 60,
  barWidth = 4,
  barHeight: baseBarHeight = 4,
  barGap = 2,
  barRadius = 2,
  barColor,
  fadeEdges = true,
  fadeWidth = 24,
  height = 128,
  className,
  ...props
}: ScrollingWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<Bar[]>([]);
  const lastTimeRef = useRef(0);
  const frameRef = useRef(0);
  const heightStyle = typeof height === "number" ? `${height}px` : height;

  const nextHeight = useCallback((index: number) => {
    const time = Date.now() / 1000;
    const wave1 = Math.sin(index * 0.35 + time * 2.4) * 0.22;
    const wave2 = Math.sin(index * 0.18 - time * 1.6) * 0.18;
    const noise = (Math.sin(index * 12.9898 + time * 3.1) * 43758.5453) % 1;
    return Math.max(0.12, Math.min(1, 0.35 + wave1 + wave2 + noise * 0.28));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const step = barWidth + barGap;
      barsRef.current = [];
      let x = rect.width;
      for (let i = 0; i < barCount; i++) {
        barsRef.current.unshift({ x, height: nextHeight(i) });
        x -= step;
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const ctx = canvas.getContext("2d");
    if (!ctx) return () => ro.disconnect();

    const animate = (time: number) => {
      const delta = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = time;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const step = barWidth + barGap;
      const color = resolveBarColor(canvas, barColor);

      for (const bar of barsRef.current) {
        bar.x -= speed * delta;
      }
      barsRef.current = barsRef.current.filter((bar) => bar.x + barWidth > -step);

      while (
        barsRef.current.length === 0 ||
        barsRef.current[barsRef.current.length - 1].x < rect.width
      ) {
        const last = barsRef.current[barsRef.current.length - 1];
        const nextX = last ? last.x + step : rect.width;
        barsRef.current.push({
          x: nextX,
          height: nextHeight(frameRef.current++),
        });
      }

      drawBars(ctx, barsRef.current, rect, {
        barWidth,
        barGap,
        barRadius,
        baseBarHeight,
        barColor: color,
        fadeEdges,
        fadeWidth,
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, [
    barCount,
    barWidth,
    barGap,
    barRadius,
    baseBarHeight,
    barColor,
    fadeEdges,
    fadeWidth,
    speed,
    nextHeight,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height: heightStyle }}
      {...props}
    >
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  );
}
