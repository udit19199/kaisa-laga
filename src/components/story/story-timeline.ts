import gsap from "gsap";
import {
  STORY_MORPH_SIZE,
  STORY_WAVEFORM_H,
  STORY_WAVEFORM_W,
} from "@/components/story/primitives/story-morph-chip";
import type { StorySceneId } from "@/components/story/story-mock";
import {
  clampStoryTime,
  STORY_SEGMENT_ENDS,
  STORY_SEGMENT_STARTS,
  STORY_TOTAL_DURATION,
} from "@/components/story/story-mock";

const EASE = "power3.inOut";
const EASE_OUT = "power3.out";

const CHIP_W = STORY_MORPH_SIZE;
const CHIP_H = STORY_MORPH_SIZE;
const CHIP_RADIUS = 22;
const CHIP_PADDING_REM = 0.85;
const LINK_W = 168;
const LINK_H = 56;
const LINK_RADIUS = LINK_H / 2;
const WAVEFORM_RADIUS = 16;
const PANEL_W = 340;
const PANEL_H = 232;
const PANEL_RADIUS = 20;

const MORPH_DURATION = 0.58;
const PANEL_MORPH_DURATION = 1.0;

function fadeRamp(progress: number, start: number, end: number) {
  return gsap.utils.clamp(0, 1, (progress - start) / (end - start));
}

function morphFrameDims(
  progress: number,
  fromW: number,
  fromH: number,
  fromR: number,
  toW: number,
  toH: number,
  toR: number,
) {
  const width = gsap.utils.interpolate(fromW, toW, progress);
  const height = gsap.utils.interpolate(fromH, toH, progress);
  const capRadius = Math.min(width, height) / 2;
  const radius = Math.min(gsap.utils.interpolate(fromR, toR, progress), capRadius);
  return { width, height, radius };
}

function applyShellAndVesselFrame(
  vessel: HTMLElement | null,
  width: number,
  height: number,
  radius: number,
) {
  if (vessel) {
    gsap.set(vessel, { width, height, borderRadius: radius });
  }
}

function crossfadeContent(
  outgoing: Element,
  incoming: Element,
  progress: number,
  outgoingScale: [number, number] = [1, 0.96],
  incomingScale: [number, number] = [0.96, 1],
) {
  const outFade = fadeRamp(progress, 0, 0.28);
  const inFade = fadeRamp(progress, 0.3, 0.72);

  gsap.set(outgoing, {
    opacity: 1 - outFade,
    scale: gsap.utils.interpolate(outgoingScale[0], outgoingScale[1], outFade),
  });
  gsap.set(incoming, {
    opacity: inFade,
    scale: gsap.utils.interpolate(incomingScale[0], incomingScale[1], inFade),
  });
}

function setVesselChipMode(vessel: HTMLElement, panelMode: boolean) {
  vessel.classList.toggle("story-vessel--chip", !panelMode);
  vessel.classList.toggle("story-vessel--panel", panelMode);
}

function addMorphTween(
  tl: gsap.core.Timeline,
  at: number,
  apply: (progress: number) => void,
  duration = MORPH_DURATION,
) {
  const state = { progress: 0 };
  tl.to(
    state,
    {
      progress: 1,
      duration,
      ease: EASE,
      onUpdate: () => apply(state.progress),
    },
    at,
  );
}

function applyQrToLinkMorphFrame(
  progress: number,
  vessel: HTMLElement | null,
  qrContent: Element,
  linkContent: Element,
) {
  const p = gsap.utils.clamp(0, 1, progress);
  const { width, height, radius } = morphFrameDims(
    p,
    CHIP_W,
    CHIP_H,
    CHIP_RADIUS,
    LINK_W,
    LINK_H,
    LINK_RADIUS,
  );

  applyShellAndVesselFrame(vessel, width, height, radius);
  crossfadeContent(qrContent, linkContent, p, [1, 0.92], [0.94, 1]);
}

function applyLinkToWaveformMorphFrame(
  progress: number,
  vessel: HTMLElement | null,
  linkContent: Element,
  waveformContent: Element,
) {
  const p = gsap.utils.clamp(0, 1, progress);
  const { width, height, radius } = morphFrameDims(
    p,
    LINK_W,
    LINK_H,
    LINK_RADIUS,
    STORY_WAVEFORM_W,
    STORY_WAVEFORM_H,
    WAVEFORM_RADIUS,
  );

  applyShellAndVesselFrame(vessel, width, height, radius);
  crossfadeContent(linkContent, waveformContent, p);
}

function applyWaveformToOverviewMorphFrame(
  progress: number,
  vessel: HTMLElement | null,
  layerMorph: Element | null,
  layerShimmer: Element | null,
  layerOverview: Element | null,
) {
  const p = gsap.utils.clamp(0, 1, progress);
  const { width, height, radius } = morphFrameDims(
    p,
    STORY_WAVEFORM_W,
    STORY_WAVEFORM_H,
    WAVEFORM_RADIUS,
    PANEL_W,
    PANEL_H,
    PANEL_RADIUS,
  );

  if (vessel) {
    gsap.set(vessel, { width, height, borderRadius: radius });
    setVesselChipMode(vessel, p >= 0.32);
  }

  const morphFade = fadeRamp(p, 0, 0.3);
  const shimmerIn = fadeRamp(p, 0.1, 0.4);
  const shimmerOut = fadeRamp(p, 0.6, 0.8);
  const overviewFade = fadeRamp(p, 0.7, 1.0);

  if (layerMorph) {
    gsap.set(layerMorph, {
      opacity: 1 - morphFade,
      scale: gsap.utils.interpolate(1, 0.94, morphFade),
    });
  }

  if (layerShimmer) {
    gsap.set(layerShimmer, {
      opacity: Math.max(0, shimmerIn - shimmerOut),
    });
  }

  if (layerOverview) {
    gsap.set(layerOverview, {
      opacity: overviewFade,
      y: gsap.utils.interpolate(10, 0, overviewFade),
    });
  }
}

function q<T extends Element>(root: ParentNode, selector: string): T | null {
  return root.querySelector(selector) as T | null;
}

export function resetPipeline(root: ParentNode) {
  const vessel = q<HTMLElement>(root, "[data-story-vessel]");
  const anchor = q<HTMLElement>(root, "[data-story-vessel-anchor]");
  const layerMorph = q(root, "[data-story-layer-morph]");
  const layerShimmer = q(root, "[data-story-layer-shimmer]");
  const qrContent = q(root, "[data-story-qr-content]");
  const linkContent = q(root, "[data-story-link-content]");
  const waveformContent = q(root, "[data-story-waveform-content]");
  const waveformFill = q<HTMLElement>(root, "[data-story-waveform-fill]");
  const layerOverview = q(root, "[data-story-layer-overview]");
  const glow = q(root, "[data-story-glow]");

  if (anchor) {
    gsap.set(anchor, { left: "50%", top: "50%", xPercent: -50, yPercent: -50, x: 0, y: 0 });
  }
  if (vessel) {
    vessel.classList.add("story-vessel--chip");
    vessel.classList.remove("story-vessel--panel");
    gsap.set(vessel, {
      width: CHIP_W,
      height: CHIP_H,
      borderRadius: CHIP_RADIUS,
      scale: 1,
      clearProps: "background,border,boxShadow",
    });
  }
  if (layerMorph) gsap.set(layerMorph, { opacity: 1, scale: 1, clearProps: "transform" });
  if (layerShimmer) gsap.set(layerShimmer, { opacity: 0 });
  if (qrContent) gsap.set(qrContent, { opacity: 1, scale: 1 });
  if (linkContent) gsap.set(linkContent, { opacity: 0, scale: 0.94 });
  if (waveformContent) gsap.set(waveformContent, { opacity: 0, scale: 0.96 });
  if (waveformFill) gsap.set(waveformFill, { width: "0%" });
  if (layerOverview) gsap.set(layerOverview, { opacity: 0, y: 10, clearProps: "transform" });
  if (glow) gsap.set(glow, { opacity: 0.35, scale: 1 });
}

export function buildFluidPipelineTimeline(root: ParentNode): gsap.core.Timeline {
  resetPipeline(root);

  const tl = gsap.timeline({ paused: true, defaults: { ease: EASE_OUT } });

  const vessel = q<HTMLElement>(root, "[data-story-vessel]");
  const layerMorph = q(root, "[data-story-layer-morph]");
  const layerShimmer = q(root, "[data-story-layer-shimmer]");
  const qrContent = q(root, "[data-story-qr-content]");
  const linkContent = q(root, "[data-story-link-content]");
  const waveformContent = q(root, "[data-story-waveform-content]");
  const waveformFill = q<HTMLElement>(root, "[data-story-waveform-fill]");
  const layerOverview = q(root, "[data-story-layer-overview]");
  const glow = q(root, "[data-story-glow]");

  tl.addLabel("scan", 0);

  // Link scene
  tl.addLabel("link", 1.15);
  if (qrContent && linkContent && vessel) {
    addMorphTween(tl, 1.15, (progress) => {
      applyQrToLinkMorphFrame(progress, vessel, qrContent, linkContent);
    });
  }

  // Record scene
  tl.addLabel("record", 2.05);
  if (linkContent && waveformContent && vessel) {
    addMorphTween(tl, 2.05, (progress) => {
      applyLinkToWaveformMorphFrame(
        progress,
        vessel,
        linkContent,
        waveformContent,
      );
    });
  }
  if (waveformFill) {
    tl.to(waveformFill, { width: "100%", duration: 2.0, ease: "none" }, 2.3);
  }
  if (glow) tl.to(glow, { opacity: 0, duration: 0.25 }, 2.05);

  // Process / Overview scene (The Magic AI Reveal)
  tl.addLabel("process", 4.55);
  tl.addLabel("overview", 6.0);

  if (vessel && layerMorph && layerOverview) {
    addMorphTween(
      tl,
      4.55,
      (progress) => {
        applyWaveformToOverviewMorphFrame(progress, vessel, layerMorph, layerShimmer, layerOverview);
      },
      1.45,
    );
  }

  return tl;
}

export function buildTimelineForScene(sceneId: StorySceneId, root: ParentNode): gsap.core.Timeline {
  return buildFluidPipelineTimeline(root);
}

export function applyStaticEndState(sceneId: StorySceneId, root: ParentNode) {
  const master = buildFluidPipelineTimeline(root);
  const end = sceneId === "full" ? STORY_TOTAL_DURATION : STORY_SEGMENT_ENDS[sceneId];
  master.time(clampStoryTime(end));
}

export function playPipelineTimeline(
  root: ParentNode,
  options?: { loop?: boolean },
): gsap.core.Timeline {
  const tl = buildFluidPipelineTimeline(root);
  if (options?.loop) {
    tl.repeat(-1);
    tl.repeatDelay(1.25);
    tl.eventCallback("onRepeat", () => {
      resetPipeline(root);
    });
  }
  tl.play(0);
  return tl;
}

export { STORY_SEGMENT_STARTS, STORY_SEGMENT_ENDS, STORY_TOTAL_DURATION };

