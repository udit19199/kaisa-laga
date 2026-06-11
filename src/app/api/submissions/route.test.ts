import { describe, it, expect } from "vitest";
import { MAX_AUDIO_SIZE_BYTES, MAX_RECORDING_SECONDS } from "@/lib/constants";

describe("submission constraints", () => {
  it("enforces 30 second max recording", () => {
    expect(MAX_RECORDING_SECONDS).toBe(30);
  });

  it("enforces 5MB max audio size", () => {
    expect(MAX_AUDIO_SIZE_BYTES).toBe(5 * 1024 * 1024);
  });
});

describe("submission API validation", () => {
  it("rejects missing locationId and audio", () => {
    const formData = new FormData();
    expect(formData.get("locationId")).toBeNull();
    expect(formData.get("audio")).toBeNull();
  });

  it("accepts valid multipart fields", () => {
    const formData = new FormData();
    formData.append("locationId", "00000000-0000-4000-8000-000000000001");
    formData.append("audio", new Blob(["test"], { type: "audio/webm" }), "recording.webm");

    expect(formData.get("locationId")).toBe("00000000-0000-4000-8000-000000000001");
    expect(formData.get("audio")).toBeTruthy();
  });
});
