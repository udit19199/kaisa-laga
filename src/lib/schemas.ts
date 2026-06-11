import { z } from "zod";
import { SENTIMENTS, TAG_TAXONOMY } from "./constants";

const tagSchema = z.enum(TAG_TAXONOMY);

export const categorizationSchema = z.object({
  sentiment: z.enum(SENTIMENTS),
  tags: z.array(z.string()).min(1).max(3),
  summary: z.string().min(1),
});

export type RawCategorization = z.infer<typeof categorizationSchema>;

export function normalizeCategorization(raw: unknown): {
  sentiment: (typeof SENTIMENTS)[number];
  tags: (typeof TAG_TAXONOMY)[number][];
  summary: string;
} {
  const parsed = categorizationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      sentiment: "Neutral",
      tags: ["Other"],
      summary: "Feedback received",
    };
  }

  const validTags = parsed.data.tags
    .map((tag) => {
      const result = tagSchema.safeParse(tag);
      return result.success ? result.data : "Other";
    })
    .filter((tag, index, arr) => arr.indexOf(tag) === index)
    .slice(0, 3);

  return {
    sentiment: parsed.data.sentiment,
    tags: validTags.length > 0 ? validTags : ["Other"],
    summary: parsed.data.summary,
  };
}

export const createSubmissionSchema = z.object({
  locationId: z.string().uuid(),
});

export const createLocationSchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  primary_language: z.string().min(2).max(10).optional(),
  alert_email: z.string().email().nullable().optional(),
});
