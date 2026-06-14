import "server-only";

import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { locations, organizations, submissions } from "@/db/schema";
import { serializeSubmission } from "@/server/serialize";

export async function listSubmissionsForOrganization(params: {
  organizationId: string;
  locationId?: string | null;
  page: number;
  pageSize: number;
}) {
  const offset = (params.page - 1) * params.pageSize;
  const filters = [eq(submissions.organizationId, params.organizationId)];

  if (params.locationId) {
    filters.push(eq(submissions.locationId, params.locationId));
  }

  const whereClause = and(...filters);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        submission: submissions,
        locationId: locations.id,
        locationName: locations.name,
      })
      .from(submissions)
      .innerJoin(locations, eq(submissions.locationId, locations.id))
      .where(whereClause)
      .orderBy(desc(submissions.createdAt))
      .limit(params.pageSize)
      .offset(offset),
    db.select({ total: count() }).from(submissions).where(whereClause),
  ]);

  const items = rows.map((row) => ({
    ...serializeSubmission(row.submission),
    locations: {
      id: row.locationId,
      name: row.locationName,
    },
  }));

  return {
    items,
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: Math.ceil(total / params.pageSize),
  };
}

export async function getSubmissionForOrganization(
  organizationId: string,
  submissionId: string,
) {
  const [row] = await db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.id, submissionId),
        eq(submissions.organizationId, organizationId),
      ),
    )
    .limit(1);

  return row ? serializeSubmission(row) : null;
}

export async function getSubmissionForProcessing(submissionId: string) {
  const [row] = await db
    .select({
      submission: submissions,
      locationId: locations.id,
      locationName: locations.name,
      locationOrganizationId: locations.organizationId,
      organizationDefaultAlertEmail: organizations.defaultAlertEmail,
      organizationAlertEmail: organizations.alertEmail,
      organizationName: organizations.name,
    })
    .from(submissions)
    .innerJoin(locations, eq(submissions.locationId, locations.id))
    .innerJoin(organizations, eq(submissions.organizationId, organizations.id))
    .where(eq(submissions.id, submissionId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    submission: row.submission,
    location: {
      id: row.locationId,
      name: row.locationName,
      organization_id: row.locationOrganizationId,
      organizations: {
        default_alert_email: row.organizationDefaultAlertEmail,
        alert_email: row.organizationAlertEmail,
        name: row.organizationName,
      },
    },
  };
}

export async function getSubmissionAudioState(submissionId: string) {
  const [row] = await db
    .select({
      audioStoragePath: submissions.audioStoragePath,
      audioRetentionConsent: submissions.audioRetentionConsent,
      audioDeletedAt: submissions.audioDeletedAt,
      status: submissions.status,
    })
    .from(submissions)
    .where(eq(submissions.id, submissionId))
    .limit(1);

  return row ?? null;
}

export async function markSubmissionProcessing(submissionId: string) {
  await db
    .update(submissions)
    .set({
      status: "processing",
      processingStartedAt: new Date().toISOString(),
      latestError: null,
      errorMessage: null,
    })
    .where(eq(submissions.id, submissionId));
}

export async function updateSubmissionAfterProcessing(
  submissionId: string,
  values: {
    originalTranscript: string;
    transcript: string;
    translatedTranscript: string;
    englishTranscript: string;
    summary: string;
    sentiment: "Positive" | "Neutral" | "Negative";
    detectedLanguage: string | null;
  },
) {
  await db
    .update(submissions)
    .set({
      status: "processed",
      originalTranscript: values.originalTranscript,
      transcript: values.transcript,
      translatedTranscript: values.translatedTranscript,
      englishTranscript: values.englishTranscript,
      summary: values.summary,
      sentiment: values.sentiment,
      detectedLanguage: values.detectedLanguage,
      processedAt: new Date().toISOString(),
      latestError: null,
      errorMessage: null,
    })
    .where(eq(submissions.id, submissionId));
}

export async function markSubmissionFailed(submissionId: string, message: string) {
  await db
    .update(submissions)
    .set({
      status: "failed",
      latestError: message,
      errorMessage: message,
    })
    .where(eq(submissions.id, submissionId));
}

export async function markSubmissionAudioDeleted(submissionId: string) {
  await db
    .update(submissions)
    .set({
      audioDeletedAt: new Date().toISOString(),
    })
    .where(eq(submissions.id, submissionId));
}
