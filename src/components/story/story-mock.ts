export const STORY_MOCK = {
  captureUrl: "https://pulsedrop.app/f/demo",
  displayUrl: "url.com",
  locationName: "Harbor Café",
  rawTranscript: "The service was good, but I had to wait longer than expected and the staff seemed rushed today.",
  tag1: "Wait time issue",
  tag2: "Staff seemed rushed",
  action: "Check peak-hour staffing",
  voiceCount: 12,
} as const;

export type StorySceneId =
  | "scan"
  | "link"
  | "record"
  | "transcript"
  | "process"
  | "overview"
  | "full";

export const STORY_SCENES: { id: StorySceneId; label: string }[] = [
  { id: "full", label: "Full journey" },
  { id: "scan", label: "Scan QR" },
  { id: "link", label: "Open Link" },
  { id: "record", label: "Record Voice" },
  { id: "transcript", label: "Transcript" },
  { id: "process", label: "AI Process" },
  { id: "overview", label: "Dashboard" },
];

/** Segment end times (seconds) on the master pipeline timeline */
export const STORY_SEGMENT_ENDS: Record<StorySceneId, number> = {
  scan: 1.15,
  link: 2.05,
  record: 4.0,
  transcript: 5.5,
  process: 7.5,
  overview: 9.5,
  full: 9.5,
};

export const STORY_SEGMENT_STARTS: Record<Exclude<StorySceneId, "full">, number> = {
  scan: 0,
  link: 1.15,
  record: 2.05,
  transcript: 4.0,
  process: 5.5,
  overview: 7.5,
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
