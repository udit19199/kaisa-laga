import type { Sentiment, SubmissionStatus, Tag } from "./constants";

type StatusTone = "default" | "secondary" | "destructive" | "outline";

export interface SubmissionInsightSource {
  status: string;
  transcript: string | null;
  translated_transcript: string | null;
  english_transcript?: string | null;
  original_transcript?: string | null;
  summary: string | null;
  sentiment: Sentiment | null;
  tags: string[];
  detected_language?: string | null;
  latest_error?: string | null;
  error_message: string | null;
  audio_retention_consent?: boolean;
  audio_deleted_at?: string | null;
}

export interface SubmissionInsights {
  status: {
    code: string;
    label: string;
    tone: StatusTone;
    isComplete: boolean;
  };
  transcript: {
    language: string | null;
    original: string | null;
    english: string | null;
    translated: string | null;
    display: string | null;
  };
  analysis: {
    sentiment: Sentiment | null;
    summary: string | null;
    tags: Tag[];
  };
  processing: {
    latestError: string | null;
    errorMessage: string | null;
    audioAvailable: boolean;
    audioDeleted: boolean;
  };
}

const STATUS_LABELS: Record<SubmissionStatus | "terminal_failed", string> = {
  accepted: "Queued",
  processing: "Processing",
  processed: "Ready",
  failed: "Failed",
  pending: "Pending",
  terminal_failed: "Failed",
};

const STATUS_TONES: Record<SubmissionStatus | "terminal_failed", StatusTone> = {
  accepted: "secondary",
  processing: "outline",
  processed: "default",
  failed: "destructive",
  pending: "secondary",
  terminal_failed: "destructive",
};

function normalizeStatus(status: string): SubmissionStatus | "terminal_failed" {
  if (status === "terminal_failed") return status;
  if (status === "accepted" || status === "processing" || status === "processed" || status === "failed" || status === "pending") {
    return status;
  }
  return "pending";
}

function isCompleteStatus(status: string): boolean {
  return status === "processed";
}

function shouldExposeStructuredInsights(status: string): boolean {
  return isCompleteStatus(status);
}

function normalizeTags(tags: string[]): Tag[] {
  return tags as Tag[];
}

export function buildSubmissionInsights(source: SubmissionInsightSource): SubmissionInsights {
  const normalizedStatus = normalizeStatus(source.status);
  const complete = shouldExposeStructuredInsights(source.status);
  const transcript = complete
    ? {
        language: source.detected_language ?? null,
        original: source.original_transcript ?? source.transcript,
        english: source.english_transcript ?? source.translated_transcript ?? source.transcript,
        translated: source.translated_transcript ?? null,
        display:
          source.english_transcript ??
          source.translated_transcript ??
          source.transcript ??
          null,
      }
    : {
        language: source.detected_language ?? null,
        original: null,
        english: null,
        translated: null,
        display: null,
      };

  return {
    status: {
      code: normalizedStatus,
      label: STATUS_LABELS[normalizedStatus],
      tone: STATUS_TONES[normalizedStatus],
      isComplete: complete,
    },
    transcript,
    analysis: {
      sentiment: complete ? source.sentiment : null,
      summary: complete ? source.summary : null,
      tags: complete ? normalizeTags(source.tags) : [],
    },
    processing: {
      latestError: source.latest_error ?? null,
      errorMessage: source.error_message ?? null,
      audioAvailable: Boolean(source.audio_retention_consent && !source.audio_deleted_at),
      audioDeleted: Boolean(source.audio_deleted_at),
    },
  };
}
