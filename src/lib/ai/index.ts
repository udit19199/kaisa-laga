import { getAIConfig } from "./config";
import { createFallbackProvider } from "./fallback";
import { createGeminiProvider } from "./providers/gemini";
import { createOpenAIProvider } from "./providers/openai";
import { createSarvamProvider } from "./providers/sarvam";
import type { AIConfig, AIProvider, AIProviderName } from "./types";

function assertProviderKey(provider: AIProviderName): void {
  if (provider === "openai" && !process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required when AI_PRIMARY_PROVIDER is openai");
  }
  if (provider === "gemini" && !process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required when AI_PRIMARY_PROVIDER is gemini");
  }
  if (provider === "sarvam" && !process.env.SARVAM_API_KEY) {
    throw new Error("SARVAM_API_KEY is required when AI_PRIMARY_PROVIDER is sarvam");
  }
}

function createProviderByName(name: AIProviderName): AIProvider | null {
  if (name === "openai") {
    if (!process.env.OPENAI_API_KEY) return null;
    return createOpenAIProvider();
  }
  if (name === "gemini") {
    if (!process.env.GEMINI_API_KEY) return null;
    return createGeminiProvider();
  }
  if (!process.env.SARVAM_API_KEY) return null;
  return createSarvamProvider();
}

export function createAIProvider(config?: AIConfig): AIProvider {
  const { primary, fallback } = config ?? getAIConfig();
  assertProviderKey(primary);

  const primaryProvider = createProviderByName(primary);
  if (!primaryProvider) {
    throw new Error(`AI provider "${primary}" is not configured`);
  }

  const fallbackProvider = fallback ? createProviderByName(fallback) : null;
  return createFallbackProvider(primaryProvider, fallbackProvider);
}

export type { AIConfig, AIProvider, AIProviderName, TranscriptionResult } from "./types";
export { getAIConfig } from "./config";
export { createOpenAIProvider } from "./providers/openai";
export { createGeminiProvider } from "./providers/gemini";
export { createSarvamProvider } from "./providers/sarvam";
