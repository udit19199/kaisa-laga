import { STORY_MOCK } from "@/components/story/story-mock";
import { cn } from "@/lib/utils";

/** Decorative capture URL chip — accent blue, not a live link. */
export function StoryLinkChip({
  url = STORY_MOCK.displayUrl,
  className,
}: {
  url?: string;
  className?: string;
}) {
  return (
    <div className={cn("story-link-chip", className)} data-story-link>
      {url}
    </div>
  );
}
