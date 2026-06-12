import { cn } from "@/lib/utils";

export const DEFAULT_RECORD_SIZE = 136;
export const DEFAULT_RING_STROKE = 3;

export function getRingMetrics(size: number, stroke = DEFAULT_RING_STROKE) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return { radius, circumference, stroke };
}

export function RecordingWaveform({
  levels,
  className,
}: {
  levels: number[];
  className?: string;
}) {
  return (
    <div
      className={cn("flex h-7 items-end justify-center gap-[3px]", className)}
      aria-hidden
      data-story-waveform
    >
      {levels.map((scale, i) => (
        <span
          key={i}
          className="story-waveform-bar w-[3px] rounded-full bg-[var(--capture-live)]"
          data-story-waveform-bar
          style={{ height: `${Math.max(18, scale * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function RecordProgressRing({
  size = DEFAULT_RECORD_SIZE,
  progress,
  showProgress = true,
  progressClassName,
  trackClassName,
}: {
  size?: number;
  progress: number;
  showProgress?: boolean;
  progressClassName?: string;
  trackClassName?: string;
}) {
  const { radius, circumference, stroke } = getRingMetrics(size);
  const offset = circumference * (1 - progress);

  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full -rotate-90"
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      data-story-record-ring
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className={cn("text-[var(--capture-live-ring)] opacity-35", trackClassName)}
      />
      {showProgress ? (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "story-record-ring-progress text-[var(--capture-live)]",
            progressClassName,
          )}
          data-story-record-ring-progress
        />
      ) : null}
    </svg>
  );
}
