import type { CategorizationResult } from "../types";

export type AIProviderName = "openai" | "gemini";

export interface TranscriptionResult {
  text: string;
  language: string;
}

export interface AIProvider {
  readonly name: AIProviderName;
  transcribeAudio(audioBuffer: Buffer, filename: string): Promise<TranscriptionResult>;
  translateText(text: string, targetLanguage: string): Promise<string>;
  categorizeFeedback(transcript: string): Promise<CategorizationResult>;
}

export interface AIConfig {
  primary: AIProviderName;
  fallback: AIProviderName | null;
}
