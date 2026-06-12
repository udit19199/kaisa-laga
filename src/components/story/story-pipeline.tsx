import { Sparkles } from "lucide-react";
import { StoryMorphChip } from "@/components/story/primitives/story-morph-chip";
import { StoryStage } from "@/components/story/primitives/story-stage";
import { STORY_MOCK } from "@/components/story/story-mock";

export function StoryPipeline() {
  return (
    <StoryStage>
      <div
        className="story-pipeline relative mx-auto flex min-h-[22rem] w-full max-w-3xl items-center justify-center sm:min-h-[26rem]"
        data-story-pipeline
      >
        <div className="absolute" data-story-vessel-anchor>
          <div
            className="story-vessel story-vessel--chip relative overflow-hidden will-change-[width,height,border-radius,transform]"
            data-story-vessel
          >
            <div className="story-vessel-glow absolute -inset-[28%]" data-story-glow aria-hidden />

            <div
              className="absolute inset-0 flex items-center justify-center"
              data-story-layer-morph
            >
              <StoryMorphChip glyphSize={132} />
            </div>

            {/* AI Shimmer effect container */}
            <div 
              className="absolute inset-0 flex items-center justify-center opacity-0 bg-[var(--brand-paper)]"
              data-story-layer-shimmer
            >
              <Sparkles className="size-10 text-[var(--brand-accent)] animate-pulse" aria-hidden />
            </div>

            <div
              className="absolute inset-0 flex min-w-0 flex-col p-5 text-left opacity-0"
              data-story-layer-overview
            >
              <div className="flex min-w-0 items-baseline justify-between gap-2">
                <p className="min-w-0 truncate text-base font-semibold text-[var(--brand-ink)]">
                  {STORY_MOCK.locationName}
                </p>
                <p className="shrink-0 text-sm text-[var(--brand-muted)]">{STORY_MOCK.voiceCount} voices</p>
              </div>
              <div className="mt-3" data-story-overview-sentiment>
                <p className="text-sm text-[var(--brand-muted)]">Overall sentiment</p>
                <div className="story-sentiment-track mt-2 h-2 overflow-hidden rounded-full">
                  <span className="block h-full w-[68%] rounded-full bg-[var(--brand-accent)]" />
                </div>
                <p className="mt-1.5 text-sm text-[var(--brand-muted)]">Mostly positive · 1 theme flagged</p>
              </div>
              <div className="mt-3 flex flex-col gap-2" data-story-overview-themes>
                <div className="story-theme-row story-theme-row-alert">
                  <span className="min-w-0 truncate text-sm font-medium text-[var(--brand-ink)]">
                    {STORY_MOCK.tag}
                  </span>
                  <span className="shrink-0 text-sm text-[var(--brand-muted)]">
                    {STORY_MOCK.tagMentions} mentions
                  </span>
                </div>
                <div className="story-theme-row">
                  <span className="min-w-0 truncate text-sm font-medium text-[var(--brand-ink)]">
                    {STORY_MOCK.secondTheme}
                  </span>
                  <span className="shrink-0 text-sm text-[var(--brand-muted)]">
                    {STORY_MOCK.secondThemeMentions} mentions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoryStage>
  );
}
