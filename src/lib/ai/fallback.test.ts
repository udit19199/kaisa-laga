import { describe, expect, it, vi } from "vitest";
import { createFallbackProvider } from "./fallback";
import type { AIProvider } from "./types";

function createMockProvider(
  name: AIProvider["name"],
  handlers: Partial<Record<keyof AIProvider, () => Promise<unknown>>>,
): AIProvider {
  return {
    name,
    transcribeAudio: handlers.transcribeAudio as AIProvider["transcribeAudio"],
    translateText: handlers.translateText as AIProvider["translateText"],
    categorizeFeedback: handlers.categorizeFeedback as AIProvider["categorizeFeedback"],
  };
}

describe("createFallbackProvider", () => {
  it("uses primary provider when it succeeds", async () => {
    const primary = createMockProvider("openai", {
      transcribeAudio: vi.fn(async () => ({ text: "hello", language: "en" })),
    });
    const fallback = createMockProvider("gemini", {
      transcribeAudio: vi.fn(async () => ({ text: "fallback", language: "en" })),
    });

    const provider = createFallbackProvider(primary, fallback);
    const result = await provider.transcribeAudio(Buffer.from("audio"), "test.webm");

    expect(result.text).toBe("hello");
    expect(primary.transcribeAudio).toHaveBeenCalledOnce();
    expect(fallback.transcribeAudio).not.toHaveBeenCalled();
  });

  it("falls back when primary fails", async () => {
    const primary = createMockProvider("openai", {
      categorizeFeedback: vi.fn(async () => {
        throw new Error("openai down");
      }),
    });
    const fallback = createMockProvider("gemini", {
      categorizeFeedback: vi.fn(async () => ({
        sentiment: "Negative",
        tags: ["Staff"],
        summary: "Rude service",
      })),
    });

    const provider = createFallbackProvider(primary, fallback);
    const result = await provider.categorizeFeedback("bad service");

    expect(result.summary).toBe("Rude service");
    expect(fallback.categorizeFeedback).toHaveBeenCalledOnce();
  });

  it("throws when both providers fail", async () => {
    const primary = createMockProvider("openai", {
      translateText: vi.fn(async () => {
        throw new Error("openai down");
      }),
    });
    const fallback = createMockProvider("gemini", {
      translateText: vi.fn(async () => {
        throw new Error("gemini down");
      }),
    });

    const provider = createFallbackProvider(primary, fallback);

    await expect(provider.translateText("hola", "en")).rejects.toThrow(
      "translateText failed on both openai and gemini",
    );
  });
});
