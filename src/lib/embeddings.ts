import "server-only";

import OpenAI from "openai";
import { EMBEDDING_DIMENSIONS } from "@/db/vector";

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";

function createEmbeddingClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
}

export async function embedText(text: string): Promise<number[] | null> {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const client = createEmbeddingClient();
  if (!client) {
    return null;
  }

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: trimmed,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  const vector = response.data[0]?.embedding;
  return vector?.length === EMBEDDING_DIMENSIONS ? vector : null;
}

export function blendEmbeddings(
  primary: number[],
  secondary: number[],
  primaryWeight: number,
): number[] {
  const secondaryWeight = 1 - primaryWeight;
  return primary.map((value, index) => {
    const other = secondary[index] ?? 0;
    return value * primaryWeight + other * secondaryWeight;
  });
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
