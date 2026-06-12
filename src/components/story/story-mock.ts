export const STORY_MOCK = {
  captureUrl: "https://pulsedrop.app/f/demo",
  displayUrl: "url.com",
  locationName: "Harbor Café",
  summary: "Wait was long but staff were lovely",
  sentiment: "Positive" as const,
  tag: "Wait times",
  tagMentions: 4,
  secondTheme: "Friendly staff",
  secondThemeMentions: 6,
  voiceCount: 12,
} as const;

export type StorySceneId =
  | "scan"
  | "link"
  | "record"
  | "process"
  | "overview"
  | "full";

export const STORY_SCENES: { id: StorySceneId; label: string }[] = [
  { id: "full", label: "Full journey" },
  { id: "scan", label: "Scan QR" },
  { id: "link", label: "Open Link" },
  { id: "record", label: "Record Voice" },
  { id: "process", label: "AI Process" },
  { id: "overview", label: "Dashboard" },
];

/** Segment end times (seconds) on the master pipeline timeline */
export const STORY_SEGMENT_ENDS: Record<StorySceneId, number> = {
  scan: 1.15,
  link: 2.05,
  record: 4.55,
  process: 6.0,
  overview: 8.0,
  full: 8.0,
};

export const STORY_SEGMENT_STARTS: Record<Exclude<StorySceneId, "full">, number> = {
  scan: 0,
  link: 1.15,
  record: 2.05,
  process: 4.55,
  overview: 6.0,
};

export const STORY_TOTAL_DURATION = STORY_SEGMENT_ENDS.full;

/** Static scene shown when motion is reduced (landing payoff frame). */
export const STORY_REDUCED_MOTION_SCENE: StorySceneId = "overview";

export const STORY_ACCESSIBLE_SUMMARY =
  "How Auris works: a customer scans a QR code, records a short voice message, and our AI instantly turns it into structured insights and operational alerts on your dashboard.";

export function clampStoryTime(seconds: number) {
  if (!Number.isFinite(seconds)) return 0;
  return Math.min(STORY_TOTAL_DURATION, Math.max(0, seconds));
}
