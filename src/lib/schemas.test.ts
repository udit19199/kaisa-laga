import { describe, it, expect } from "vitest";
import { normalizeCategorization } from "@/lib/schemas";

describe("normalizeCategorization", () => {
  it("accepts valid categorization", () => {
    const result = normalizeCategorization({
      sentiment: "Negative",
      tags: ["Cleanliness", "Bathroom"],
      summary: "Dirty restroom reported",
    });

    expect(result.sentiment).toBe("Negative");
    expect(result.tags).toEqual(["Cleanliness", "Bathroom"]);
    expect(result.summary).toBe("Dirty restroom reported");
  });

  it("falls back invalid tags to Other", () => {
    const result = normalizeCategorization({
      sentiment: "Neutral",
      tags: ["Made Up Category"],
      summary: "Some feedback",
    });

    expect(result.tags).toEqual(["Other"]);
  });

  it("falls back entirely on malformed input", () => {
    const result = normalizeCategorization({ invalid: true });

    expect(result.sentiment).toBe("Neutral");
    expect(result.tags).toEqual(["Other"]);
    expect(result.summary).toBe("Feedback received");
  });

  it("deduplicates tags", () => {
    const result = normalizeCategorization({
      sentiment: "Positive",
      tags: ["Staff", "Staff", "Atmosphere"],
      summary: "Great service",
    });

    expect(result.tags).toEqual(["Staff", "Atmosphere"]);
  });

  it("limits to 3 tags after deduplication", () => {
    const result = normalizeCategorization({
      sentiment: "Negative",
      tags: ["Wait Time", "Staff", "Cleanliness"],
      summary: "Multiple issues",
    });

    expect(result.tags).toHaveLength(3);
  });
});
