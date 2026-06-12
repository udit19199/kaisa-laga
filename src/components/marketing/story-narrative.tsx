"use client";

import { useEffect, useRef, useState } from "react";
import "@/components/story/story-tokens.css";
import { StoryPipelineView } from "@/components/story/story-pipeline-view";
import {
  STORY_ACCESSIBLE_SUMMARY,
  STORY_REDUCED_MOTION_SCENE,
} from "@/components/story/story-mock";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const STORY_ENTER_RATIO = 0.42;

export function StoryNarrative() {
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section || started) return;

    const scroller = section.closest(".landing-scroller");
    const begin = () => setStarted(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= STORY_ENTER_RATIO) {
          begin();
          observer.disconnect();
        }
      },
      {
        root: scroller instanceof Element ? scroller : null,
        threshold: [0, STORY_ENTER_RATIO, 0.55],
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, [started, reducedMotion]);

  const sceneId = reducedMotion
    ? STORY_REDUCED_MOTION_SCENE
    : started
      ? "full"
      : "scan";

  return (
    <section
      ref={sectionRef}
      id="product"
      className="landing-story relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-16 sm:px-6"
      aria-label="How Auris works"
    >
      <p className="sr-only">{STORY_ACCESSIBLE_SUMMARY}</p>
      <div className="w-full max-w-3xl">
        <StoryPipelineView
          sceneId={sceneId}
          playing={!reducedMotion && started}
          idleAtStart={!reducedMotion && !started}
          loop={!reducedMotion && started}
        />
      </div>
    </section>
  );
}
