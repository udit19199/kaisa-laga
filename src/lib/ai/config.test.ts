import { afterEach, describe, expect, it } from "vitest";
import { getAIConfig } from "./config";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("getAIConfig", () => {
  it("defaults to gemini with no fallback when only Gemini key is set", () => {
    process.env.GEMINI_API_KEY = "gem-test";
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_PRIMARY_PROVIDER;
    delete process.env.AI_FALLBACK_PROVIDER;

    expect(getAIConfig()).toEqual({ primary: "gemini", fallback: null });
  });

  it("auto-selects openai fallback when both keys are present", () => {
    process.env.OPENAI_API_KEY = "sk-test";
    process.env.GEMINI_API_KEY = "gem-test";
    delete process.env.AI_PRIMARY_PROVIDER;
    delete process.env.AI_FALLBACK_PROVIDER;

    expect(getAIConfig()).toEqual({ primary: "gemini", fallback: "openai" });
  });

  it("respects explicit provider selection", () => {
    process.env.GEMINI_API_KEY = "gem-test";
    process.env.AI_PRIMARY_PROVIDER = "gemini";
    process.env.AI_FALLBACK_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = "sk-test";

    expect(getAIConfig()).toEqual({ primary: "gemini", fallback: "openai" });
  });

  it("disables fallback when AI_FALLBACK_PROVIDER is none", () => {
    process.env.OPENAI_API_KEY = "sk-test";
    process.env.GEMINI_API_KEY = "gem-test";
    process.env.AI_FALLBACK_PROVIDER = "none";

    expect(getAIConfig().fallback).toBeNull();
  });
});
