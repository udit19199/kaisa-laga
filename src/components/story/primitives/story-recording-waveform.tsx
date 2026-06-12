"use client";

import { Waveform } from "@/components/ui/waveform";
import { cn } from "@/lib/utils";

/** Matches demo layout: height 80, 3×2 bars, edge fade, full width. */
export const STORY_WAVEFORM_W = 300;
export const STORY_WAVEFORM_H = 80;

const BAR_WIDTH = 3;
const BAR_GAP = 2;
const BAR_COUNT = 60;

const STORY_WAVEFORM_DATA = Array.from({ length: BAR_COUNT }, (_, i) => {
  const wave1 = Math.sin(i * 0.35) * 0.22;
  const wave2 = Math.sin(i * 0.18 + 0.6) * 0.16;
  const noise = (Math.sin(i * 12.9898) * 43758.5453) % 1;
  return Math.max(0.12, Math.min(0.95, 0.28 + wave1 + wave2 + noise * 0.22));
});

const waveProps = {
  data: STORY_WAVEFORM_DATA,
  height: STORY_WAVEFORM_H,
  barWidth: BAR_WIDTH,
  barGap: BAR_GAP,
  barRadius: 2,
  fadeEdges: true,
  fadeWidth: 24,
  className: "w-full bg-transparent",
} as const;

/**
 * Demo-style static waveform; accent layer reveals left→right while recording.
 */
export function StoryRecordingWaveform({ className }: { className?: string }) {
  return (
    <div
      className={cn("story-recording-waveform relative w-full bg-transparent", className)}
      style={{ height: STORY_WAVEFORM_H }}
      data-story-recording-waveform
    >
      <Waveform {...waveProps} barColor="gray" aria-hidden />
      <div
        className="absolute inset-y-0 left-0 overflow-hidden bg-transparent"
        data-story-waveform-fill
        style={{ width: "0%" }}
        aria-hidden
      >
        <div className="h-full" style={{ width: STORY_WAVEFORM_W }}>
          <Waveform {...waveProps} barColor="var(--brand-accent)" />
        </div>
      </div>
    </div>
  );
}
