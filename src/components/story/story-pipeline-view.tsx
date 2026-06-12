"use client";

import { useLayoutEffect, useRef } from "react";
import type { StorySceneId } from "@/components/story/story-mock";
import { clampStoryTime, STORY_SEGMENT_ENDS } from "@/components/story/story-mock";
import { StoryPipeline } from "@/components/story/story-pipeline";
import {
  buildFluidPipelineTimeline,
  resetPipeline,
} from "@/components/story/story-timeline";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function StoryPipelineView({
  sceneId,
  playing = false,
  idleAtStart = false,
  playToken = 0,
  loop = false,
  scrubTime,
  onTimeUpdate,
}: {
  sceneId: StorySceneId;
  playing?: boolean;
  /** When true and not playing, hold frame 0 (landing idle). */
  idleAtStart?: boolean;
  /** Increment to restart the full journey from t=0. */
  playToken?: number;
  /** Loop the full journey after each completion. */
  loop?: boolean;
  /** When set (and not playing), seek the timeline to this second. */
  scrubTime?: number;
  /** Fired while the timeline plays (for syncing a scrubber). */
  onTimeUpdate?: (time: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const reducedMotion = usePrefersReducedMotion();
  onTimeUpdateRef.current = onTimeUpdate;

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const tl = buildFluidPipelineTimeline(root);
    timelineRef.current = tl;

    return () => {
      tl.kill();
      timelineRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const root = containerRef.current;
    const tl = timelineRef.current;
    if (!root || !tl) return;

    const clearPlayCallbacks = () => {
      tl.eventCallback("onUpdate", null);
      tl.eventCallback("onRepeat", null);
      tl.repeat(0);
      tl.repeatDelay(0);
    };

    const seekTo = (time: number) => {
      tl.pause();
      tl.time(clampStoryTime(time));
    };

    if (playing && sceneId === "full" && !reducedMotion) {
      clearPlayCallbacks();
      resetPipeline(root);
      tl.pause();
      tl.time(0);

      if (loop) {
        tl.repeat(-1);
        tl.repeatDelay(1.25);
        tl.eventCallback("onRepeat", () => {
          resetPipeline(root);
        });
      }

      tl.eventCallback("onUpdate", () => {
        onTimeUpdateRef.current?.(clampStoryTime(tl.time()));
      });
      tl.play(0);

      return () => {
        tl.pause();
        clearPlayCallbacks();
      };
    }

    clearPlayCallbacks();
    tl.pause();

    if (scrubTime != null) {
      seekTo(scrubTime);
    } else if (idleAtStart && sceneId === "scan") {
      seekTo(0);
    } else {
      const end =
        sceneId === "full" ? STORY_SEGMENT_ENDS.full : STORY_SEGMENT_ENDS[sceneId];
      seekTo(end);
    }

    if (scrubTime != null) {
      onTimeUpdateRef.current?.(clampStoryTime(tl.time()));
    }

    return undefined;
  }, [sceneId, playing, idleAtStart, playToken, loop, scrubTime, reducedMotion]);

  return (
    <div ref={containerRef} className="w-full">
      <div aria-hidden="true">
        <StoryPipeline />
      </div>
    </div>
  );
}
