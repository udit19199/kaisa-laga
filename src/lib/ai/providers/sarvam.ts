import { SarvamAIClient } from "sarvamai";
import type { SarvamAI } from "sarvamai";
import { normalizeCategorization } from "../../schemas";
import type { CategorizationResult } from "../../types";
import { CATEGORIZATION_SYSTEM_PROMPT } from "../prompts";
import type { AIProvider, TranscriptionResult } from "../types";

const SARVAM_ENGLISH_CODE = "en-IN";

const SARVAM_LANGUAGE_CODES: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  mr: "mr-IN",
  od: "od-IN",
  pa: "pa-IN",
  ta: "ta-IN",
  te: "te-IN",
  gu: "gu-IN",
  as: "as-IN",
  ur: "ur-IN",
  ne: "ne-IN",
  kok: "kok-IN",
  ks: "ks-IN",
  sd: "sd-IN",
  sa: "sa-IN",
  sat: "sat-IN",
  mni: "mni-IN",
  brx: "brx-IN",
  mai: "mai-IN",
  doi: "doi-IN",
};

function toSarvamLanguageCode(language: string): SarvamAI.TranslateTargetLanguage {
  const normalized = language.trim();
  if (!normalized) return SARVAM_ENGLISH_CODE;
  if (normalized.includes("-")) {
    return normalized as SarvamAI.TranslateTargetLanguage;
  }
  return (SARVAM_LANGUAGE_CODES[normalized] ?? normalized) as SarvamAI.TranslateTargetLanguage;
}

function isEnglishLanguage(language: string | undefined): boolean {
  return language?.toLowerCase().startsWith("en") ?? false;
}

function createAudioFile(audioBuffer: Buffer, filename: string): File {
  return new File([new Uint8Array(audioBuffer)], filename, { type: "audio/webm" });
}

export function createSarvamProvider(apiKey?: string): AIProvider {
  const client = new SarvamAIClient({
    apiSubscriptionKey: apiKey ?? process.env.SARVAM_API_KEY,
    timeoutInSeconds: 60,
    maxRetries: 3,
  });
  const speechModel = (process.env.SARVAM_STT_MODEL ?? "saaras:v3") as SarvamAI.SpeechToTextModel;
  const translationModel = (process.env.SARVAM_TRANSLATION_MODEL ??
    "sarvam-translate:v1") as SarvamAI.TranslateModel;
  const chatModel = (process.env.SARVAM_CHAT_MODEL ?? "sarvam-30b") as SarvamAI.SarvamModelIds;

  return {
    name: "sarvam",

    async transcribeAudio(audioBuffer, filename): Promise<TranscriptionResult> {
      const file = createAudioFile(audioBuffer, filename);
      const transcription = await client.speechToText.transcribe({
        file,
        model: speechModel,
        mode: "transcribe",
        language_code: "unknown",
      });

      const language = transcription.language_code ?? "en-IN";
      const text = transcription.transcript?.trim() ?? "";

      if (!text || isEnglishLanguage(language)) {
        return {
          text,
          language,
          englishText: text,
        };
      }

      const englishTranslation = await client.speechToText.transcribe({
        file: createAudioFile(audioBuffer, filename),
        model: speechModel,
        mode: "translate",
        language_code: "unknown",
      });

      return {
        text,
        language,
        englishText: englishTranslation.transcript?.trim() ?? text,
      };
    },

    async translateText(text, targetLanguage): Promise<string> {
      const response = await client.text.translate({
        input: text,
        source_language_code: "auto",
        target_language_code: toSarvamLanguageCode(targetLanguage),
        model: translationModel,
        mode: "formal",
      });

      return response.translated_text?.trim() ?? text;
    },

    async categorizeFeedback(transcript): Promise<CategorizationResult> {
      const response = await client.chat.completions({
        model: chatModel,
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `${CATEGORIZATION_SYSTEM_PROMPT} Return strict JSON with keys sentiment, tags, summary.`,
          },
          { role: "user", content: transcript },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { sentiment: "Neutral", tags: ["Other"], summary: "Feedback received" };
      }

      try {
        return normalizeCategorization(JSON.parse(content));
      } catch {
        return { sentiment: "Neutral", tags: ["Other"], summary: "Feedback received" };
      }
    },
  };
}
