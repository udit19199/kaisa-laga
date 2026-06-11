/**
 * @deprecated Import from `@/lib/ai` instead. Kept for backward compatibility.
 */
export {
  createOpenAIProvider as createOpenAIClient,
  createOpenAIProvider,
} from "./ai/providers/openai";
export { createAIProvider } from "./ai";

import { createOpenAIProvider } from "./ai/providers/openai";

/** @deprecated Use `createAIProvider()` from `@/lib/ai` for multi-provider support. */
export async function transcribeAudio(
  client: ReturnType<typeof createOpenAIProvider>,
  audioBuffer: Buffer,
  filename: string,
) {
  return client.transcribeAudio(audioBuffer, filename);
}

/** @deprecated Use `createAIProvider()` from `@/lib/ai` for multi-provider support. */
export async function translateText(
  client: ReturnType<typeof createOpenAIProvider>,
  text: string,
  targetLanguage: string,
) {
  return client.translateText(text, targetLanguage);
}

/** @deprecated Use `createAIProvider()` from `@/lib/ai` for multi-provider support. */
export async function categorizeFeedback(
  client: ReturnType<typeof createOpenAIProvider>,
  transcript: string,
) {
  return client.categorizeFeedback(transcript);
}
