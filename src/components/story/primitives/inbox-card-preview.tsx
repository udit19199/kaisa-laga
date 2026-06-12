import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STORY_MOCK } from "@/components/story/story-mock";

export function InboxCardPreview({ className }: { className?: string }) {
  return (
    <article
      className={cn("story-panel-surface w-full max-w-[17.5rem] rounded-xl p-4 text-left", className)}
      data-story-inbox-card
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--story-ink)]">{STORY_MOCK.locationName}</p>
          <p className="mt-0.5 text-xs text-[var(--story-muted)]">Just now</p>
        </div>
        <Badge data-story-inbox-badge>{STORY_MOCK.sentiment}</Badge>
      </header>
      <p className="mt-3 text-sm font-medium text-[var(--story-ink)]" data-story-inbox-summary>
        {STORY_MOCK.summary}
      </p>
      <div className="mt-3 flex flex-wrap gap-1" data-story-inbox-tags>
        <Badge variant="secondary">{STORY_MOCK.tag}</Badge>
      </div>
    </article>
  );
}
