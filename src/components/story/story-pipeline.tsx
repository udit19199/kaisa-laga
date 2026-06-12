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

            {/* Transcript layer */}
            <div
              className="absolute inset-0 flex items-center justify-center p-6 opacity-0 bg-[var(--brand-paper)]"
              data-story-layer-transcript
            >
              <p className="text-lg leading-relaxed text-[var(--brand-ink)] text-center italic">
                &quot;<span data-story-transcript-highlight>{STORY_MOCK.rawTranscript}</span>&quot;
              </p>
            </div>

            {/* AI Shimmer effect container */}
            <div 
              className="absolute inset-0 flex items-center justify-center opacity-0 bg-[var(--brand-paper)]"
              data-story-layer-shimmer
            >
              <Sparkles className="size-10 text-[var(--brand-accent)] animate-pulse" aria-hidden />
            </div>

            <div
              className="absolute inset-0 flex min-w-0 flex-col p-5 text-left opacity-0 bg-white"
              data-story-layer-overview
            >
              <div className="flex min-w-0 items-baseline justify-between gap-2 border-b border-gray-100 pb-3">
                <p className="min-w-0 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Actionable Insights
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-3" data-story-overview-themes>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-base font-medium text-gray-900">
                    {STORY_MOCK.tag1}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-base font-medium text-gray-900">
                    {STORY_MOCK.tag2}
                  </span>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-gray-100" data-story-overview-sentiment>
                <p className="text-sm font-semibold text-[var(--brand-accent)]">Action: {STORY_MOCK.action}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoryStage>
  );
}
