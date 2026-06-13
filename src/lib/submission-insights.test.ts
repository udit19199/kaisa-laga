import { describe, expect, it } from "vitest";
import { buildSubmissionInsights } from "./submission-insights";

describe("buildSubmissionInsights", () => {
  it("exposes structured content only for processed submissions", () => {
    const result = buildSubmissionInsights({
      status: "processed",
      transcript: "The coffee was great.",
      translated_transcript: null,
      english_transcript: "The coffee was great.",
      original_transcript: "The coffee was great.",
      summary: "Great coffee",
      sentiment: "Positive",
      tags: ["Staff", "Atmosphere"],
      detected_language: "en",
      latest_error: null,
      error_message: null,
      audio_retention_consent: true,
      audio_deleted_at: null,
    });

    expect(result.status.isComplete).toBe(true);
    expect(result.analysis.summary).toBe("Great coffee");
    expect(result.analysis.tags).toEqual(["Staff", "Atmosphere"]);
    expect(result.transcript.display).toBe("The coffee was great.");
  });

  it("hides transcript and insights while processing or failed", () => {
    const result = buildSubmissionInsights({
      status: "failed",
      transcript: "stale transcript",
      translated_transcript: "stale translated transcript",
      english_transcript: "stale english transcript",
      original_transcript: "stale original transcript",
      summary: "stale summary",
      sentiment: "Negative",
      tags: ["Other"],
      detected_language: "en",
      latest_error: "Processing failed after retries",
      error_message: "Processing failed after retries",
      audio_retention_consent: false,
      audio_deleted_at: "2026-06-13T00:00:00.000Z",
    });

    expect(result.status.isComplete).toBe(false);
    expect(result.analysis.summary).toBeNull();
    expect(result.analysis.tags).toEqual([]);
    expect(result.transcript.display).toBeNull();
    expect(result.processing.errorMessage).toBe("Processing failed after retries");
  });
});
