import { StoryQrGlyph } from "@/components/story/assets/story-qr-glyph";
import { cn } from "@/lib/utils";

/** Canonical story QR — decorative glyph on frosted glass (not scannable). */
export function StoryQrAsset({
  className,
  glyphSize = 104,
}: {
  className?: string;
  glyphSize?: number;
}) {
  return (
    <div
      className={cn("story-qr-asset flex items-center justify-center", className)}
      data-story-qr-asset
    >
      <div className="story-qr-tile" data-story-qr-tile>
        <StoryQrGlyph size={glyphSize} className="text-[var(--brand-accent)]" />
      </div>
    </div>
  );
}
