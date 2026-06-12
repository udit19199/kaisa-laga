import { describe, expect, it } from "vitest";
import { clampStoryTime, STORY_TOTAL_DURATION } from "@/components/story/story-mock";

describe("clampStoryTime", () => {
  it("clamps to timeline bounds", () => {
    expect(clampStoryTime(-1)).toBe(0);
    expect(clampStoryTime(0)).toBe(0);
    expect(clampStoryTime(STORY_TOTAL_DURATION)).toBe(STORY_TOTAL_DURATION);
    expect(clampStoryTime(STORY_TOTAL_DURATION + 5)).toBe(STORY_TOTAL_DURATION);
  });

  it("returns 0 for non-finite input", () => {
    expect(clampStoryTime(Number.NaN)).toBe(0);
    expect(clampStoryTime(Number.POSITIVE_INFINITY)).toBe(0);
  });
});
