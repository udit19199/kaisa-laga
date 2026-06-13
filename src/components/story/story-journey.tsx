"use client";

import { useCallback, useEffect, useState } from "react";
import { LiquidGlass } from "@/components/liquid-glass";
import "@/components/story/story-tokens.css";
import {
  STORY_ACCESSIBLE_SUMMARY,
  STORY_SCENES,
  STORY_SEGMENT_ENDS,
  STORY_TOTAL_DURATION,
  clampStoryTime,
  type StorySceneId,
} from "@/components/story/story-mock";
import { StoryPipelineView } from "@/components/story/story-pipeline-view";
import { useLiquidGlassDynamic } from "@/hooks/use-liquid-glass-dynamic";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  return `${clampStoryTime(seconds).toFixed(1)}s`;
}

type StoryJourneyProps = {
  id?: string;
  className?: string;
  showIntro?: boolean;
  showFooter?: boolean;
  /** Chapter jump buttons — for internal /demo preview only */
  showChapters?: boolean;
};

export function StoryJourney({
  id = "product",
  className,
  showIntro = false,
  showFooter = true,
  showChapters = false,
}: StoryJourneyProps) {
  const reducedMotion = usePrefersReducedMotion();
  useLiquidGlassDynamic("[data-liquid-dynamic]");
  const [activeScene, setActiveScene] = useState<StorySceneId>("full");
  const [playing, setPlaying] = useState(true);
  const [playToken, setPlayToken] = useState(1);
  const [scrubTime, setScrubTime] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      const raf = requestAnimationFrame(() => setPlaying(false));
      return () => cancelAnimationFrame(raf);
    }
  }, [reducedMotion]);

  const replay = () => {
    setActiveScene("full");
    setScrubTime(0);
    if (reducedMotion) {
      setPlaying(false);
      return;
    }
    setPlaying(true);
    setPlayToken((t) => t + 1);
  };

  const selectScene = (sceneId: StorySceneId) => {
    setActiveScene(sceneId);
    if (reducedMotion || sceneId !== "full") {
      setPlaying(false);
      setScrubTime(sceneId === "full" ? 0 : STORY_SEGMENT_ENDS[sceneId]);
      return;
    }
    setPlaying(true);
    setScrubTime(0);
    setPlayToken((t) => t + 1);
  };

  const onScrub = useCallback((value: number) => {
    setPlaying(false);
    setActiveScene("full");
    setScrubTime(clampStoryTime(value));
  }, []);

  return (
    <section
      id={id}
      aria-label="How Kaisa Laga works"
      className={cn(
        "relative z-20 mx-auto w-full max-w-4xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16",
        className,
      )}
    >
      <p className="sr-only">{STORY_ACCESSIBLE_SUMMARY}</p>

      {showIntro ? (
        <header className="mb-8 text-center">
          <p className="text-sm font-medium text-[var(--brand-muted)]">How it works</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--brand-muted)]">
            Scan → link → tap → record → mail → manager tap → dashboard
          </p>
          {reducedMotion ? (
            <p className="mx-auto mt-3 max-w-md text-xs text-[var(--brand-muted)]">
              {showChapters
                ? "Reduced motion is on. Use chapter buttons or the scrubber to inspect static frames."
                : "Reduced motion is on. Use the scrubber to inspect static frames."}
            </p>
          ) : null}
        </header>
      ) : reducedMotion ? (
        <p className="mx-auto mb-6 max-w-md text-center text-xs text-[var(--brand-muted)]">
          {showChapters
            ? "Reduced motion is on. Use chapter buttons or the scrubber to inspect static frames."
            : "Reduced motion is on. Use the scrubber to inspect static frames."}
        </p>
      ) : null}

      <div className="mb-4 flex justify-center">
        <LiquidGlass
          as="button"
          type="button"
          variant="panel"
          onClick={replay}
          className="rounded-full px-4 py-1.5 text-sm font-medium text-[var(--brand-ink)]"
        >
          {reducedMotion ? "Reset to start" : "Replay journey"}
        </LiquidGlass>
      </div>

      {showChapters ? (
        <nav className="mb-6 flex flex-wrap justify-center gap-2" aria-label="Story chapters">
          {STORY_SCENES.map((scene) =>
            activeScene === scene.id ? (
              <button
                key={scene.id}
                type="button"
                onClick={() => selectScene(scene.id)}
                className="rounded-full bg-[var(--brand-ink)] px-3.5 py-1.5 text-sm font-medium text-[var(--brand-paper)] transition-colors"
              >
                {scene.label}
              </button>
            ) : (
              <LiquidGlass
                key={scene.id}
                as="button"
                type="button"
                variant="panel"
                onClick={() => selectScene(scene.id)}
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-[var(--brand-muted)] transition-colors hover:text-[var(--brand-ink)]"
              >
                {scene.label}
              </LiquidGlass>
            ),
          )}
        </nav>
      ) : null}

      <div data-liquid-dynamic>
        <StoryPipelineView
          sceneId={activeScene}
          playing={playing}
          playToken={playToken}
          scrubTime={playing ? undefined : scrubTime}
          onTimeUpdate={(time) => setScrubTime(clampStoryTime(time))}
        />
      </div>

      <div className="mx-auto mt-6 w-full max-w-lg">
        <label className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-[var(--brand-muted)]">
            <span>Scrub timeline</span>
            <span className="tabular-nums">
              {formatTime(scrubTime)} / {formatTime(STORY_TOTAL_DURATION)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={STORY_TOTAL_DURATION}
            step={0.02}
            value={clampStoryTime(scrubTime)}
            onChange={(e) => onScrub(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--brand-ink)]/10 accent-[var(--brand-ink)]"
            aria-valuemin={0}
            aria-valuemax={STORY_TOTAL_DURATION}
            aria-valuenow={clampStoryTime(scrubTime)}
            aria-label="Scrub through the pipeline animation"
          />
        </label>
      </div>

      {showFooter ? (
        <p className="mt-10 text-center text-xs text-[var(--brand-muted)]">
          QR → voice → structured inbox. No app download for your guests.
        </p>
      ) : null}
    </section>
  );
}
