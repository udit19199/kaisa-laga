import OpenAI from "openai";
import { normalizeCategorization } from "../../schemas";
import type { CategorizationResult } from "../../types";
import {
  CATEGORIZATION_SYSTEM_PROMPT,
  OPENAI_CATEGORIZATION_JSON_SCHEMA,
  translateSystemPrompt,
} from "../prompts";
import type { AIProvider, TranscriptionResult } from "../types";

export function createOpenAIProvider(apiKey?: string): AIProvider {
  const client = new OpenAI({ apiKey: apiKey ?? process.env.OPENAI_API_KEY });
  const chatModel = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
  const whisperModel = process.env.OPENAI_WHISPER_MODEL ?? "whisper-1";

  return {
    name: "openai",

    async transcribeAudio(audioBuffer, filename): Promise<TranscriptionResult> {
      const file = new File([new Uint8Array(audioBuffer)], filename, { type: "audio/webm" });
      const response = await client.audio.transcriptions.create({
        file,
        model: whisperModel,
        response_format: "verbose_json",
      });

      return {
        text: response.text,
        language: response.language ?? "en",
      };
    },

    async translateText(text, targetLanguage): Promise<string> {
      const response = await client.chat.completions.create({
        model: chatModel,
        messages: [
          { role: "system", content: translateSystemPrompt(targetLanguage) },
          { role: "user", content: text },
        ],
      });

      return response.choices[0]?.message?.content?.trim() ?? text;
    },

    async categorizeFeedback(transcript): Promise<CategorizationResult> {
      const response = await client.chat.completions.create({
        model: chatModel,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "feedback_categorization",
            strict: true,
            schema: OPENAI_CATEGORIZATION_JSON_SCHEMA,
          },
        },
        messages: [
          { role: "system", content: CATEGORIZATION_SYSTEM_PROMPT },
          { role: "user", content: transcript },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { sentiment: "Neutral", tags: ["Other"], summary: "Feedback received" };
      }

      return normalizeCategorization(JSON.parse(content));
    },
  };
}
