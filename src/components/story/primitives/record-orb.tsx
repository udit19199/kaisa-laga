import { DEFAULT_RECORD_SIZE } from "@/lib/constants";
import { Mic } from "lucide-react";
import {
  RecordProgressRing,
  RecordingWaveform,
} from "@/components/capture/record-primitives";
import { cn } from "@/lib/utils";

const DEMO_LEVELS = [0.35, 0.55, 0.82, 0.65, 0.48, 0.72, 0.4];

export function RecordOrb({
  size = DEFAULT_RECORD_SIZE,
  progress = 0,
  showWaveform = true,
  className,
}: {
  size?: number;
  progress?: number;
  showWaveform?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative flex flex-col items-center gap-4", className)} data-story-record-wrap>
      <div className="story-float-glow" aria-hidden data-story-record-glow />
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
        data-story-record-orb
      >
        <RecordProgressRing
          size={size}
          progress={progress}
          showProgress
          progressClassName="!text-[var(--story-accent)]"
          trackClassName="!text-[var(--story-accent-ring)]"
        />
        <div
          className="relative z-10 flex items-center justify-center rounded-full bg-[var(--capture-mic)] text-white shadow-lg"
          style={{ width: size, height: size }}
          data-story-record-button
        >
          <Mic className="size-11 stroke-[1.75]" aria-hidden />
        </div>
      </div>
      {showWaveform ? (
        <RecordingWaveform
          levels={DEMO_LEVELS}
          className="[&_.story-waveform-bar]:bg-[var(--story-accent)]"
        />
      ) : null}
    </div>
  );
}
