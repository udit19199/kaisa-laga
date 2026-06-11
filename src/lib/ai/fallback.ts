import type { AIProvider } from "./types";

async function withProviderFallback<T>(
  operation: (provider: AIProvider) => Promise<T>,
  primary: AIProvider,
  fallback: AIProvider | null,
  operationName: string,
): Promise<T> {
  try {
    return await operation(primary);
  } catch (primaryError) {
    if (!fallback) throw primaryError;

    console.warn(
      `[ai] ${operationName} failed on ${primary.name}, retrying with ${fallback.name}:`,
      primaryError,
    );

    try {
      return await operation(fallback);
    } catch (fallbackError) {
      const message = `[ai] ${operationName} failed on both ${primary.name} and ${fallback.name}`;
      console.error(message, { primaryError, fallbackError });
      throw new Error(message, { cause: fallbackError });
    }
  }
}

export function createFallbackProvider(
  primary: AIProvider,
  fallback: AIProvider | null,
): AIProvider {
  return {
    name: primary.name,

    transcribeAudio(audioBuffer, filename) {
      return withProviderFallback(
        (provider) => provider.transcribeAudio(audioBuffer, filename),
        primary,
        fallback,
        "transcribeAudio",
      );
    },

    translateText(text, targetLanguage) {
      return withProviderFallback(
        (provider) => provider.translateText(text, targetLanguage),
        primary,
        fallback,
        "translateText",
      );
    },

    categorizeFeedback(transcript) {
      return withProviderFallback(
        (provider) => provider.categorizeFeedback(transcript),
        primary,
        fallback,
        "categorizeFeedback",
      );
    },
  };
}
