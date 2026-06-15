import { Type } from "@google/genai";
import { TAG_TAXONOMY } from "../constants";

export function translateSystemPrompt(targetLanguage: string): string {
  return `Translate the following customer feedback to ${targetLanguage}. Return only the translation, no explanation.`;
}

export const CATEGORIZATION_SYSTEM_PROMPT = `You categorize customer voice feedback for physical businesses. Select 1-3 tags from: ${TAG_TAXONOMY.join(", ")}. Assign sentiment as Positive, Neutral, or Negative. Write a one-line summary for the operator.`;



export const GEMINI_CATEGORIZATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    sentiment: {
      type: Type.STRING,
      enum: ["Positive", "Neutral", "Negative"],
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING, enum: [...TAG_TAXONOMY] },
    },
    summary: { type: Type.STRING },
  },
  required: ["sentiment", "tags", "summary"],
};

export const GEMINI_TRANSCRIPTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING },
    language: { type: Type.STRING },
  },
  required: ["text", "language"],
};
