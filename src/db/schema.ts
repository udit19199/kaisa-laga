import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { embeddingVector } from "@/db/vector";

const timestampWithTimezone = {
  withTimezone: true,
  mode: "string" as const,
};

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "processed",
  "failed",
  "accepted",
  "processing",
  "terminal_failed",
]);

export const sentimentTypeEnum = pgEnum("sentiment_type", [
  "Positive",
  "Neutral",
  "Negative",
]);

export const membershipRoleEnum = pgEnum("membership_role", [
  "owner",
  "manager",
  "viewer",
]);

export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "revoked",
  "expired",
]);

export const subscriptionPeriodStatusEnum = pgEnum(
  "subscription_period_status",
  ["active", "scheduled", "closed", "canceled"],
);

export const usageEventTypeEnum = pgEnum("usage_event_type", [
  "billable_acceptance",
]);

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    primaryLanguage: text("primary_language").notNull().default("en"),
    alertEmail: text("alert_email"),
    defaultAlertEmail: text("default_alert_email"),
    currentSubscriptionPeriodId: uuid("current_subscription_period_id"),
    billingStatus: text("billing_status").notNull().default("active"),
    deletionRequestedAt: timestamp(
      "deletion_requested_at",
      timestampWithTimezone,
    ),
    deletionScheduledAt: timestamp(
      "deletion_scheduled_at",
      timestampWithTimezone,
    ),
    // The current app and post-Clerk migrations treat this as a string identifier.
    ownerUserId: text("owner_user_id"),
    clerkUserId: text("clerk_user_id"),
    createdAt: timestamp("created_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_organizations_clerk_user_id").on(table.clerkUserId),
    uniqueIndex("organizations_clerk_user_id_key").on(table.clerkUserId),
    uniqueIndex("organizations_current_subscription_period_id_key")
      .on(table.currentSubscriptionPeriodId)
      .where(sql`${table.currentSubscriptionPeriodId} is not null`),
  ],
);

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  monthlyReviewLimit: integer("monthly_review_limit").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
  createdAt: timestamp("created_at", timestampWithTimezone)
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", timestampWithTimezone)
    .notNull()
    .defaultNow(),
});

export const locations = pgTable(
  "locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
      }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    tagline: text("tagline"),
    coverImageUrl: text("cover_image_url"),
    searchDocument: text("search_document"),
    tasteSummary: text("taste_summary"),
    tasteThemes: text("taste_themes").array().default(sql`'{}'::text[]`),
    searchEmbedding: embeddingVector("search_embedding"),
    publicCaptureToken: text("public_capture_token").notNull(),
    alertEmailOverride: text("alert_email_override"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_locations_org_id").on(table.orgId),
    uniqueIndex("locations_public_capture_token_key")
      .on(table.publicCaptureToken)
      .where(sql`${table.publicCaptureToken} is not null`),
  ],
);

export const organizationMemberships = pgTable(
  "organization_memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    clerkUserId: text("clerk_user_id").notNull(),
    role: membershipRoleEnum("role").notNull().default("viewer"),
    createdAt: timestamp("created_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("organization_memberships_organization_id_clerk_user_id_key").on(
      table.organizationId,
      table.clerkUserId,
    ),
    uniqueIndex("organization_memberships_clerk_user_id_key").on(
      table.clerkUserId,
    ),
  ],
);

export const organizationInvitations = pgTable(
  "organization_invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    invitedEmail: text("invited_email").notNull(),
    role: membershipRoleEnum("role").notNull().default("viewer"),
    token: text("token").notNull().unique(),
    status: invitationStatusEnum("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at", timestampWithTimezone).notNull(),
    invitedByClerkUserId: text("invited_by_clerk_user_id").notNull(),
    createdAt: timestamp("created_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("organization_invitations_org_email_pending_key")
      .on(table.organizationId, table.invitedEmail)
      .where(sql`${table.status} = 'pending'`),
  ],
);

export const organizationSubscriptionPeriods = pgTable(
  "organization_subscription_periods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id),
    periodStart: timestamp("period_start", timestampWithTimezone).notNull(),
    periodEnd: timestamp("period_end", timestampWithTimezone).notNull(),
    baseReviewLimitSnapshot: integer("base_review_limit_snapshot").notNull(),
    effectiveReviewLimit: integer("effective_review_limit").notNull(),
    reviewsUsed: integer("reviews_used").notNull().default(0),
    status: subscriptionPeriodStatusEnum("status")
      .notNull()
      .default("active"),
    createdAt: timestamp("created_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("organization_subscription_periods_active_key")
      .on(table.organizationId)
      .where(sql`${table.status} = 'active'`),
  ],
);

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    status: submissionStatusEnum("status").notNull().default("accepted"),
    audioStoragePath: text("audio_storage_path").notNull(),
    audioRetentionConsent: boolean("audio_retention_consent")
      .notNull()
      .default(false),
    originalTranscript: text("original_transcript"),
    transcript: text("transcript"),
    translatedTranscript: text("translated_transcript"),
    englishTranscript: text("english_transcript"),
    summary: text("summary"),
    sentiment: sentimentTypeEnum("sentiment"),
    tags: text("tags").array().default(sql`'{}'::text[]`),
    detectedLanguage: text("detected_language"),
    latestError: text("latest_error"),
    errorMessage: text("error_message"),
    acceptedAt: timestamp("accepted_at", timestampWithTimezone).defaultNow(),
    processingStartedAt: timestamp(
      "processing_started_at",
      timestampWithTimezone,
    ),
    createdAt: timestamp("created_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processed_at", timestampWithTimezone),
    isPublic: boolean("is_public").notNull().default(false),
    publishedAt: timestamp("published_at", timestampWithTimezone),
    previewEndsAt: timestamp("preview_ends_at", timestampWithTimezone),
    idempotencyKey: text("idempotency_key"),
    audioDeletedAt: timestamp("audio_deleted_at", timestampWithTimezone),
  },
  (table) => [
    index("idx_submissions_location_id").on(table.locationId),
    index("idx_submissions_status").on(table.status),
    index("idx_submissions_created_at").on(table.createdAt),
    index("idx_submissions_is_public").on(table.isPublic),
    uniqueIndex("submissions_org_idempotency_key_key")
      .on(table.organizationId, table.idempotencyKey)
      .where(sql`${table.idempotencyKey} is not null`),
    check(
      "submissions_idempotency_key_not_blank",
      sql`${table.idempotencyKey} is null or length(btrim(${table.idempotencyKey})) > 0`,
    ),
  ],
);

export const diners = pgTable(
  "diners",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    displayName: text("display_name"),
    onboarding: jsonb("onboarding").notNull().default(sql`'{}'::jsonb`),
    tasteDocument: text("taste_document"),
    tasteEmbedding: embeddingVector("taste_embedding"),
    onboardingEmbedding: embeddingVector("onboarding_embedding"),
    linkedReviewCount: integer("linked_review_count").notNull().default(0),
    onboardingCompletedAt: timestamp(
      "onboarding_completed_at",
      timestampWithTimezone,
    ),
    createdAt: timestamp("created_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("diners_clerk_user_id_key").on(table.clerkUserId),
    index("idx_diners_clerk_user_id").on(table.clerkUserId),
  ],
);

export const dinerSubmissions = pgTable(
  "diner_submissions",
  {
    dinerId: uuid("diner_id")
      .notNull()
      .references(() => diners.id, { onDelete: "cascade" }),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.dinerId, table.submissionId] }),
    uniqueIndex("diner_submissions_submission_id_key").on(table.submissionId),
    index("idx_diner_submissions_diner_id").on(table.dinerId),
  ],
);

export const submissionTags = pgTable(
  "submission_tags",
  {
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
    createdAt: timestamp("created_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.submissionId, table.tag] })],
);

export const submissionProcessingAttempts = pgTable(
  "submission_processing_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    attemptNumber: integer("attempt_number").notNull(),
    stage: text("stage").notNull(),
    provider: text("provider"),
    model: text("model"),
    status: text("status").notNull(),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at", timestampWithTimezone),
    finishedAt: timestamp("finished_at", timestampWithTimezone),
    createdAt: timestamp("created_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("submission_processing_attempts_submission_attempt_key").on(
      table.submissionId,
      table.attemptNumber,
    ),
  ],
);

export const usageEvents = pgTable(
  "usage_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    subscriptionPeriodId: uuid("subscription_period_id")
      .notNull()
      .references(() => organizationSubscriptionPeriods.id, {
        onDelete: "cascade",
      }),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    eventType: usageEventTypeEnum("event_type").notNull(),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("usage_events_submission_id_key").on(table.submissionId)],
);

export const submissionDispatchOutbox = pgTable(
  "submission_dispatch_outbox",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    status: text("status").notNull().default("pending"),
    attemptCount: integer("attempt_count").notNull().default(0),
    lastError: text("last_error"),
    lastAttemptAt: timestamp("last_attempt_at", timestampWithTimezone),
    dispatchedAt: timestamp("dispatched_at", timestampWithTimezone),
    createdAt: timestamp("created_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", timestampWithTimezone)
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("submission_dispatch_outbox_submission_event_key").on(
      table.submissionId,
      table.eventType,
    ),
    index("submission_dispatch_outbox_status_updated_at_key").on(
      table.status,
      table.updatedAt,
    ),
    check(
      "submission_dispatch_outbox_status_check",
      sql`${table.status} in ('pending', 'processing', 'dispatched', 'failed')`,
    ),
  ],
);
