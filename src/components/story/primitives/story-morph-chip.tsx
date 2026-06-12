"use client";

import { Mail } from "lucide-react";
import { StoryQrGlyph } from "@/components/story/assets/story-qr-glyph";
import {
  StoryRecordingWaveform,
  STORY_WAVEFORM_H,
  STORY_WAVEFORM_W,
} from "@/components/story/primitives/story-recording-waveform";
import { STORY_MOCK } from "@/components/story/story-mock";
import { cn } from "@/lib/utils";

export const STORY_MORPH_SIZE = 200;
export { STORY_WAVEFORM_W, STORY_WAVEFORM_H };

/** QR / link / mail in frosted shell; waveform sits outside shell (no glass). */
export function StoryMorphChip({
  glyphSize = 132,
  className,
}: {
  glyphSize?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("story-morph-wrap relative", className)}
      data-story-morph-wrap
      style={{ width: STORY_MORPH_SIZE, height: STORY_MORPH_SIZE }}
    >
      <div
        className="story-morph-shell size-full"
        data-story-morph-shell
      >
        <div
          className="pointer-events-none absolute inset-2 overflow-hidden rounded-[0.85rem]"
          aria-hidden
        >
          <div
            className="absolute inset-x-0 top-0 h-[3px] text-[var(--brand-accent)] opacity-0"
            data-story-scan-beam
          >
            <svg className="h-full w-full" viewBox="0 0 200 8" preserveAspectRatio="none">
              <path
                d="M0 4 C24 1 48 7 72 4 C96 1 120 7 144 4 C168 1 188 7 200 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>

        <div className="story-morph-qr" data-story-qr-content>
          <StoryQrGlyph size={glyphSize} className="text-[var(--brand-accent)]" />
        </div>

        <span className="story-morph-link" data-story-link-content>
          {STORY_MOCK.displayUrl}
        </span>

        <div className="story-morph-icon" data-story-mail-content>
          <Mail className="size-12 stroke-[1.5] text-[var(--brand-accent)]" aria-hidden />
        </div>
      </div>

      <div className="story-morph-waveform" data-story-waveform-content>
        <StoryRecordingWaveform />
      </div>
    </div>
  );
}
