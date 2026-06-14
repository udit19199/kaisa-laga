import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  dinerSubmissions,
  diners,
  locations,
  submissions,
} from "@/db/schema";
import { blendEmbeddings, cosineSimilarity, embedText } from "@/lib/embeddings";
import type { DinerOnboarding, VenueMatch } from "@/lib/taste/types";
import { serializeDiner, type DinerContext } from "@/server/auth/diner-context";

const LINKED_REVIEW_BLEND_THRESHOLD = 3;
const REVIEW_BLEND_WEIGHT = 0.7;

function publishPreviewDays(): number {
  const raw = process.env.PUBLISH_PREVIEW_DAYS;
  if (raw === undefined || raw === "") {
    return 7;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 7;
}

export function buildOnboardingDocument(onboarding: DinerOnboarding): string {
  const parts: string[] = [];

  if (onboarding.dietary && onboarding.dietary !== "none") {
    parts.push(`Dietary preference: ${onboarding.dietary.replace(/_/g, " ")}`);
  }

  if (onboarding.allergies.length > 0) {
    parts.push(`Allergies: ${onboarding.allergies.join(", ")}`);
  }

  if (onboarding.otherAllergies?.trim()) {
    parts.push(`Other allergies: ${onboarding.otherAllergies.trim()}`);
  }

  if (onboarding.spiceLevel) {
    parts.push(`Spice comfort: ${onboarding.spiceLevel.replace(/_/g, " ")}`);
  }

  if (onboarding.budgetBand) {
    parts.push(`Budget: ${onboarding.budgetBand}`);
  }

  return parts.join(". ");
}

export async function updateDinerOnboarding(
  dinerId: string,
  onboarding: DinerOnboarding,
) {
  const tasteDocument = buildOnboardingDocument(onboarding);
  const onboardingEmbedding = await embedText(tasteDocument);

  const [row] = await db
    .update(diners)
    .set({
      onboarding,
      tasteDocument,
      onboardingEmbedding: onboardingEmbedding ?? undefined,
      onboardingCompletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(diners.id, dinerId))
    .returning();

  if (!row) {
    return null;
  }

  await refreshDinerTasteEmbedding(dinerId);
  return serializeDiner(row);
}

export async function linkSubmissionToDiner(dinerId: string, submissionId: string) {
  const [submission] = await db
    .select({
      id: submissions.id,
      status: submissions.status,
    })
    .from(submissions)
    .where(eq(submissions.id, submissionId))
    .limit(1);

  if (
    !submission ||
    !["accepted", "processing", "processed"].includes(submission.status)
  ) {
    return { ok: false as const, error: "Submission not found or not linkable yet" };
  }

  const inserted = await db
    .insert(dinerSubmissions)
    .values({ dinerId, submissionId })
    .onConflictDoNothing()
    .returning({ submissionId: dinerSubmissions.submissionId });

  if (inserted.length === 0) {
    return { ok: false as const, error: "Review already linked to an account" };
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(dinerSubmissions)
    .where(eq(dinerSubmissions.dinerId, dinerId));

  await db
    .update(diners)
    .set({
      linkedReviewCount: count,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(diners.id, dinerId));

  await refreshDinerTasteEmbedding(dinerId);

  return { ok: true as const };
}

async function buildReviewTasteDocument(dinerId: string): Promise<string> {
  const rows = await db
    .select({
      summary: submissions.summary,
      transcript: submissions.englishTranscript,
      tags: submissions.tags,
      locationName: locations.name,
    })
    .from(dinerSubmissions)
    .innerJoin(submissions, eq(dinerSubmissions.submissionId, submissions.id))
    .innerJoin(locations, eq(submissions.locationId, locations.id))
    .where(eq(dinerSubmissions.dinerId, dinerId))
    .orderBy(desc(submissions.createdAt))
    .limit(20);

  return rows
    .map((row) => {
      const text = row.summary ?? row.transcript ?? "";
      const tags = row.tags?.length ? ` Tags: ${row.tags.join(", ")}` : "";
      return `${row.locationName}: ${text}${tags}`;
    })
    .join("\n");
}

export async function refreshDinerTasteEmbedding(dinerId: string) {
  const [diner] = await db.select().from(diners).where(eq(diners.id, dinerId)).limit(1);
  if (!diner) {
    return;
  }

  const reviewDocument = await buildReviewTasteDocument(dinerId);
  const reviewEmbedding = reviewDocument ? await embedText(reviewDocument) : null;
  const onboardingEmbedding = diner.onboardingEmbedding ?? null;

  let tasteEmbedding = onboardingEmbedding;
  let tasteDocument = diner.tasteDocument ?? buildOnboardingDocument(
    diner.onboarding as DinerOnboarding,
  );

  if (reviewEmbedding && diner.linkedReviewCount >= LINKED_REVIEW_BLEND_THRESHOLD) {
    tasteEmbedding =
      onboardingEmbedding && onboardingEmbedding.length === reviewEmbedding.length
        ? blendEmbeddings(reviewEmbedding, onboardingEmbedding, REVIEW_BLEND_WEIGHT)
        : reviewEmbedding;
    tasteDocument = `${reviewDocument}\n\n${buildOnboardingDocument(diner.onboarding as DinerOnboarding)}`;
  } else if (reviewEmbedding) {
    tasteEmbedding = reviewEmbedding;
    tasteDocument = reviewDocument;
  }

  await db
    .update(diners)
    .set({
      tasteDocument,
      tasteEmbedding: tasteEmbedding ?? undefined,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(diners.id, dinerId));
}

export async function scheduleSubmissionPublish(submissionId: string, locationId: string) {
  const previewDays = publishPreviewDays();
  const previewEndsAt = new Date();
  previewEndsAt.setDate(previewEndsAt.getDate() + previewDays);

  await db
    .update(submissions)
    .set({
      previewEndsAt: previewEndsAt.toISOString(),
      ...(previewDays === 0
        ? { isPublic: true, publishedAt: new Date().toISOString() }
        : {}),
    })
    .where(eq(submissions.id, submissionId));

  if (previewDays === 0) {
    await refreshLocationTaste(locationId);
  }
}

export async function publishSubmission(submissionId: string) {
  const [row] = await db
    .update(submissions)
    .set({
      isPublic: true,
      publishedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(submissions.id, submissionId),
        eq(submissions.isPublic, false),
        eq(submissions.status, "processed"),
      ),
    )
    .returning({ locationId: submissions.locationId });

  if (row) {
    await refreshLocationTaste(row.locationId);
  }

  return Boolean(row);
}

export async function refreshLocationTaste(locationId: string) {
  const publicReviews = await db
    .select({
      summary: submissions.summary,
      transcript: submissions.englishTranscript,
      tags: submissions.tags,
      sentiment: submissions.sentiment,
    })
    .from(submissions)
    .where(
      and(
        eq(submissions.locationId, locationId),
        eq(submissions.isPublic, true),
        eq(submissions.status, "processed"),
      ),
    )
    .orderBy(desc(submissions.createdAt))
    .limit(50);

  if (publicReviews.length === 0) {
    return;
  }

  const [location] = await db
    .select({ name: locations.name, tagline: locations.tagline })
    .from(locations)
    .where(eq(locations.id, locationId))
    .limit(1);

  if (!location) {
    return;
  }

  const reviewLines = publicReviews
    .map((review) => review.summary ?? review.transcript ?? "")
    .filter(Boolean);

  const searchDocument = [
    location.name,
    location.tagline,
    ...reviewLines,
    ...publicReviews.flatMap((review) => review.tags ?? []),
  ]
    .filter(Boolean)
    .join("\n");

  const themes = [
    ...new Set(publicReviews.flatMap((review) => review.tags ?? []).slice(0, 8)),
  ];

  const tasteSummary = reviewLines[0]
    ? `Guests describe ${location.name} as: ${reviewLines[0].slice(0, 160)}`
    : null;

  const searchEmbedding = await embedText(searchDocument);

  await db
    .update(locations)
    .set({
      searchDocument,
      tasteSummary,
      tasteThemes: themes,
      searchEmbedding: searchEmbedding ?? undefined,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(locations.id, locationId));
}

function matchCopyForVenue(name: string): string {
  return `Feels like your kind of place — ${name} matches what you've been enjoying.`;
}

export async function getMatchesForDiner(diner: DinerContext): Promise<VenueMatch[]> {
  const [dinerRow] = await db
    .select({
      tasteEmbedding: diners.tasteEmbedding,
      onboardingEmbedding: diners.onboardingEmbedding,
    })
    .from(diners)
    .where(eq(diners.id, diner.id))
    .limit(1);

  const tasteVector =
    dinerRow?.tasteEmbedding ??
    dinerRow?.onboardingEmbedding ??
    null;

  const venueRows = await db
    .select({
      id: locations.id,
      name: locations.name,
      tagline: locations.tagline,
      coverImageUrl: locations.coverImageUrl,
      tasteSummary: locations.tasteSummary,
      searchEmbedding: locations.searchEmbedding,
    })
    .from(locations)
    .where(and(eq(locations.isActive, true), sql`${locations.searchEmbedding} is not null`));

  const ranked = venueRows
    .map((venue) => ({
      venue,
      score: tasteVector && venue.searchEmbedding
        ? cosineSimilarity(tasteVector, venue.searchEmbedding)
        : 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  const matches: VenueMatch[] = [];

  for (const { venue } of ranked) {
    const [sample] = await db
      .select({
        summary: submissions.summary,
        transcript: submissions.englishTranscript,
      })
      .from(submissions)
      .where(
        and(
          eq(submissions.locationId, venue.id),
          eq(submissions.isPublic, true),
          eq(submissions.status, "processed"),
        ),
      )
      .orderBy(desc(submissions.createdAt))
      .limit(1);

    matches.push({
      locationId: venue.id,
      name: venue.name,
      tagline: venue.tagline,
      coverImageUrl: venue.coverImageUrl,
      tasteSummary: venue.tasteSummary,
      sampleQuote: sample?.summary ?? sample?.transcript ?? null,
      matchCopy: matchCopyForVenue(venue.name),
    });
  }

  return matches;
}

export async function updateLocationBranding(
  organizationId: string,
  locationId: string,
  updates: { name?: string; tagline?: string | null; coverImageUrl?: string | null },
) {
  const [row] = await db
    .update(locations)
    .set({
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.tagline !== undefined ? { tagline: updates.tagline } : {}),
      ...(updates.coverImageUrl !== undefined
        ? { coverImageUrl: updates.coverImageUrl }
        : {}),
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(eq(locations.id, locationId), eq(locations.organizationId, organizationId)),
    )
    .returning();

  if (row) {
    await refreshLocationTaste(locationId);
  }

  return row ?? null;
}

export async function getLocationTastePanel(
  organizationId: string,
  locationId: string,
) {
  const [row] = await db
    .select({
      id: locations.id,
      name: locations.name,
      tagline: locations.tagline,
      coverImageUrl: locations.coverImageUrl,
      tasteSummary: locations.tasteSummary,
      tasteThemes: locations.tasteThemes,
      searchDocument: locations.searchDocument,
    })
    .from(locations)
    .where(
      and(eq(locations.id, locationId), eq(locations.organizationId, organizationId)),
    )
    .limit(1);

  return row ?? null;
}
