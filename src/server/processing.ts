import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  claimSubmissionDispatchOutbox,
  retrySubmissionDispatch,
} from "@/db/rpc";
import {
  submissionDispatchOutbox,
  submissionProcessingAttempts,
  submissionTags,
} from "@/db/schema";

export { claimSubmissionDispatchOutbox, retrySubmissionDispatch };

export async function getLatestProcessingAttemptNumber(submissionId: string) {
  const [row] = await db
    .select({ attemptNumber: submissionProcessingAttempts.attemptNumber })
    .from(submissionProcessingAttempts)
    .where(eq(submissionProcessingAttempts.submissionId, submissionId))
    .orderBy(desc(submissionProcessingAttempts.attemptNumber))
    .limit(1);

  return row?.attemptNumber ?? 0;
}

export async function createProcessingAttempt(submissionId: string, attemptNumber: number) {
  const [row] = await db
    .insert(submissionProcessingAttempts)
    .values({
      submissionId,
      attemptNumber,
      stage: "download",
      provider: "sarvam+gemini",
      status: "processing",
      startedAt: new Date().toISOString(),
    })
    .returning({ attemptNumber: submissionProcessingAttempts.attemptNumber });

  if (!row) {
    throw new Error("Failed to create processing attempt");
  }

  return row.attemptNumber;
}

export async function completeProcessingAttempt(
  submissionId: string,
  attemptNumber: number,
) {
  await db
    .update(submissionProcessingAttempts)
    .set({
      stage: "complete",
      status: "processed",
      finishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(submissionProcessingAttempts.submissionId, submissionId),
        eq(submissionProcessingAttempts.attemptNumber, attemptNumber),
      ),
    );
}

export async function failProcessingAttempt(
  submissionId: string,
  attemptNumber: number,
  message: string,
) {
  await db
    .update(submissionProcessingAttempts)
    .set({
      stage: "failed",
      status: "failed",
      errorMessage: message,
      finishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(submissionProcessingAttempts.submissionId, submissionId),
        eq(submissionProcessingAttempts.attemptNumber, attemptNumber),
      ),
    );
}

export async function replaceSubmissionTags(submissionId: string, tags: string[]) {
  await db
    .delete(submissionTags)
    .where(eq(submissionTags.submissionId, submissionId));

  if (tags.length === 0) {
    return;
  }

  await db.insert(submissionTags).values(
    tags.map((tag) => ({
      submissionId,
      tag,
    })),
  );
}

export async function markOutboxDispatched(outboxId: string) {
  await db
    .update(submissionDispatchOutbox)
    .set({
      status: "dispatched",
      dispatchedAt: new Date().toISOString(),
      lastError: null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(submissionDispatchOutbox.id, outboxId));
}

export async function markOutboxFailed(outboxId: string, message: string) {
  await db
    .update(submissionDispatchOutbox)
    .set({
      status: "failed",
      lastError: message,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(submissionDispatchOutbox.id, outboxId));
}

export async function markOutboxUnsupported(outboxId: string, eventType: string) {
  await db
    .update(submissionDispatchOutbox)
    .set({
      status: "failed",
      lastError: `Unsupported outbox event type: ${eventType}`,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(submissionDispatchOutbox.id, outboxId));
}

export async function getLatestProcessingAttempt(submissionId: string) {
  const [row] = await db
    .select({
      id: submissionProcessingAttempts.id,
      attemptNumber: submissionProcessingAttempts.attemptNumber,
    })
    .from(submissionProcessingAttempts)
    .where(eq(submissionProcessingAttempts.submissionId, submissionId))
    .orderBy(desc(submissionProcessingAttempts.attemptNumber))
    .limit(1);

  return row ?? null;
}
