export const MAX_RECORDING_SECONDS = 30;
export const MAX_AUDIO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const DASHBOARD_POLL_INTERVAL_MS = 30_000;
export const AUDIO_RETENTION_DAYS = 90;
export const DEFAULT_RECORD_SIZE = 136;

export const TAG_TAXONOMY = [
  "Wait Time",
  "Staff",
  "Cleanliness",
  "Food Quality",
  "Noise",
  "Pricing",
  "Bathroom",
  "Atmosphere",
  "Parking",
  "Other",
] as const;

export type Tag = (typeof TAG_TAXONOMY)[number];

export const SENTIMENTS = ["Positive", "Neutral", "Negative"] as const;
export type Sentiment = (typeof SENTIMENTS)[number];

export const SUBMISSION_STATUSES = [
  "accepted",
  "processing",
  "processed",
  "failed",
  "pending",
] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const FIXABLE_KEYWORDS = [
  "dirty",
  "cold",
  "hot",
  "loud",
  "broken",
  "smell",
  "wait",
  "slow",
  "rude",
  "empty",
  "closed",
  "wet",
  "sticky",
  "hair",
  "bug",
  "roach",
  "mold",
] as const;

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh", label: "Chinese" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
] as const;
