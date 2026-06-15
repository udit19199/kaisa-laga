import { z } from "zod";
import { SENTIMENTS, TAG_TAXONOMY } from "./constants";

const tagSchema = z.enum(TAG_TAXONOMY);

const categorizationSchema = z.object({
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

  const uniqueTags = new Set<(typeof TAG_TAXONOMY)[number]>();
  for (const tag of parsed.data.tags) {
    const result = tagSchema.safeParse(tag);
    uniqueTags.add(result.success ? result.data : "Other");
  }
  const validTags = Array.from(uniqueTags).slice(0, 3);

  return {
    sentiment: parsed.data.sentiment,
    tags: validTags.length > 0 ? validTags : ["Other"],
    summary: parsed.data.summary,
  };
}

export const createSubmissionSchema = z.object({
  locationId: z.uuid(),
  retentionConsent: z.boolean().default(false),
});

export const createLocationSchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  primary_language: z.string().min(2).max(10).optional(),
  alert_email: z.email().nullable().optional(),
});
