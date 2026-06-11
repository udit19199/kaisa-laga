import type { AIConfig, AIProviderName } from "./types";

const PROVIDER_NAMES: AIProviderName[] = ["openai", "gemini"];

function parseProvider(value: string | undefined): AIProviderName | null | undefined {
  if (value === undefined || value === "") return undefined;
  if (value === "none") return null;
  if (PROVIDER_NAMES.includes(value as AIProviderName)) {
    return value as AIProviderName;
  }
  return undefined;
}

function hasProviderKey(provider: AIProviderName): boolean {
  if (provider === "openai") return Boolean(process.env.OPENAI_API_KEY);
  return Boolean(process.env.GEMINI_API_KEY);
}

function defaultFallback(primary: AIProviderName): AIProviderName | null {
  const alternate: AIProviderName = primary === "openai" ? "gemini" : "openai";
  return hasProviderKey(alternate) ? alternate : null;
}

export function getAIConfig(): AIConfig {
  const primary = parseProvider(process.env.AI_PRIMARY_PROVIDER) ?? "gemini";
  const explicitFallback = parseProvider(process.env.AI_FALLBACK_PROVIDER);
  const fallback =
    explicitFallback === undefined ? defaultFallback(primary) : explicitFallback;

  if (fallback === primary) {
    return { primary, fallback: null };
  }

  return { primary, fallback };
}
