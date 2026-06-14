import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/db";

type RpcRow = Record<string, unknown>;

function firstRow<T extends RpcRow>(rows: Iterable<T>): T | null {
  for (const row of rows) {
    return row;
  }
  return null;
}

function allRows<T extends RpcRow>(rows: Iterable<T>): T[] {
  return [...rows];
}

export type AcceptPublicSubmissionResult = {
  submission_id: string;
  organization_id: string;
  location_id: string;
  subscription_period_id: string;
  billable_event_id: string;
  created_new: boolean;
  reviews_used: number;
  effective_review_limit: number;
  status: string;
  dispatch_status: string;
};

export async function acceptPublicSubmission(params: {
  captureToken: string;
  submissionId: string;
  idempotencyKey: string;
  audioStoragePath: string;
  audioMimeType: string | null;
  retentionConsent: boolean;
}): Promise<AcceptPublicSubmissionResult | null> {
  const rows = await db.execute(sql`
    SELECT * FROM accept_public_submission(
      ${params.captureToken},
      ${params.submissionId}::uuid,
      ${params.idempotencyKey},
      ${params.audioStoragePath},
      ${params.audioMimeType},
      ${params.retentionConsent}
    )
  `);

  const row = firstRow(rows as Iterable<AcceptPublicSubmissionResult>);
  return row ?? null;
}

export type ProvisionOrganizationResult = {
  organization_id: string;
  membership_id: string;
  subscription_period_id: string;
};

export async function provisionOrganization(params: {
  name: string;
  clerkUserId: string;
  clerkUserEmail: string | null;
  primaryLanguage?: string;
}): Promise<ProvisionOrganizationResult | null> {
  const rows = await db.execute(sql`
    SELECT * FROM provision_organization(
      ${params.name},
      ${params.clerkUserId},
      ${params.clerkUserEmail},
      ${params.primaryLanguage ?? "en"}
    )
  `);

  const row = firstRow(rows as Iterable<ProvisionOrganizationResult>);
  return row ?? null;
}

export type RetrySubmissionDispatchResult = {
  submission_id: string;
  dispatch_status: string;
  status: string;
};

export async function retrySubmissionDispatch(
  submissionId: string,
): Promise<RetrySubmissionDispatchResult | null> {
  const rows = await db.execute(sql`
    SELECT * FROM retry_submission_dispatch(${submissionId}::uuid)
  `);

  const row = firstRow(rows as Iterable<RetrySubmissionDispatchResult>);
  return row ?? null;
}

export type SubmissionDispatchOutboxRow = {
  id: string;
  submission_id: string;
  event_type: string;
  status: string;
  attempt_count: number;
  last_error: string | null;
  last_attempt_at: string | null;
  dispatched_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function claimSubmissionDispatchOutbox(
  limit = 20,
): Promise<SubmissionDispatchOutboxRow[]> {
  const rows = await db.execute(sql`
    SELECT * FROM claim_submission_dispatch_outbox(${limit})
  `);

  return allRows(rows as Iterable<SubmissionDispatchOutboxRow>);
}
