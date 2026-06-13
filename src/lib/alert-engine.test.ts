import { describe, it, expect } from "vitest";
import { evaluateAlert, buildAlertPayload } from "@/lib/alert-engine";
import { FIXABLE_KEYWORDS } from "@/lib/constants";

describe("evaluateAlert", () => {
  it("returns no alert for positive sentiment", () => {
    const result = evaluateAlert("Positive", "the bathroom was dirty", FIXABLE_KEYWORDS);
    expect(result.shouldAlert).toBe(false);
    expect(result.matchedKeywords).toEqual([]);
  });

  it("returns no alert for negative sentiment without keywords", () => {
    const result = evaluateAlert("Negative", "the food was mediocre", FIXABLE_KEYWORDS);
    expect(result.shouldAlert).toBe(false);
  });

  it("returns alert for negative sentiment with fixable keyword", () => {
    const result = evaluateAlert("Negative", "The bathroom was dirty and smelled bad", FIXABLE_KEYWORDS);
    expect(result.shouldAlert).toBe(true);
    expect(result.matchedKeywords).toContain("dirty");
    expect(result.matchedKeywords).toContain("smell");
  });

  it("matches keywords case-insensitively", () => {
    const result = evaluateAlert("Negative", "We had to WAIT forever", FIXABLE_KEYWORDS);
    expect(result.shouldAlert).toBe(true);
    expect(result.matchedKeywords).toContain("wait");
  });
});

describe("buildAlertPayload", () => {
  it("builds payload with dashboard link", () => {
    const payload = buildAlertPayload({
      locationName: "Downtown",
      transcript: "Cold food",
      tags: ["Food Quality"],
      timestamp: "2026-06-11T12:00:00Z",
      submissionId: "abc-123",
      appUrl: "https://app.kaisa-laga.app",
    });

    expect(payload.locationName).toBe("Downtown");
    expect(payload.dashboardUrl).toBe("https://app.kaisa-laga.app/dashboard?submission=abc-123");
  });
});
