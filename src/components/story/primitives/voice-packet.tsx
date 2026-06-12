import { cn } from "@/lib/utils";

function MiniWaveform() {
  const heights = [40, 70, 100, 55, 85, 45, 65];
  return (
    <div className="flex h-4 items-end gap-[2px]" aria-hidden>
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-[var(--story-accent)]"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export function VoicePacket({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "story-panel-surface flex items-center gap-2.5 rounded-full px-3.5 py-2",
        className,
      )}
      data-story-voice-packet
    >
      <MiniWaveform />
      <span className="text-xs font-medium text-[var(--story-ink)]">Voice</span>
    </div>
  );
}
