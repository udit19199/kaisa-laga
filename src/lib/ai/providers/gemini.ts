import { createPartFromBase64, GoogleGenAI } from "@google/genai";
import { normalizeCategorization } from "../../schemas";
import type { CategorizationResult } from "../../types";
import {
  CATEGORIZATION_SYSTEM_PROMPT,
  GEMINI_CATEGORIZATION_SCHEMA,
  GEMINI_TRANSCRIPTION_SCHEMA,
  translateSystemPrompt,
} from "../prompts";
import type { AIProvider, TranscriptionResult } from "../types";

export function createGeminiProvider(apiKey?: string): AIProvider {
  const client = new GoogleGenAI({ apiKey: apiKey ?? process.env.GEMINI_API_KEY });
  const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

  return {
    name: "gemini",

    async transcribeAudio(audioBuffer, filename): Promise<TranscriptionResult> {
      const mimeType = filename.endsWith(".webm") ? "audio/webm" : "audio/webm";
      const response = await client.models.generateContent({
        model,
        contents: [
          createPartFromBase64(audioBuffer.toString("base64"), mimeType),
          "Transcribe this customer feedback audio. Return the exact spoken text and ISO 639-1 language code.",
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: GEMINI_TRANSCRIPTION_SCHEMA,
        },
      });

      const parsed = JSON.parse(response.text ?? "{}") as Partial<TranscriptionResult>;
      return {
        text: parsed.text ?? "",
        language: parsed.language ?? "en",
      };
    },

    async translateText(text, targetLanguage): Promise<string> {
      const response = await client.models.generateContent({
        model,
        contents: [
          { role: "user", parts: [{ text: `${translateSystemPrompt(targetLanguage)}\n\n${text}` }] },
        ],
      });

      return response.text?.trim() ?? text;
    },

    async categorizeFeedback(transcript): Promise<CategorizationResult> {
      const response = await client.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [{ text: `${CATEGORIZATION_SYSTEM_PROMPT}\n\n${transcript}` }],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: GEMINI_CATEGORIZATION_SCHEMA,
        },
      });

      const content = response.text;
      if (!content) {
        return { sentiment: "Neutral", tags: ["Other"], summary: "Feedback received" };
      }

      return normalizeCategorization(JSON.parse(content));
    },
  };
}
