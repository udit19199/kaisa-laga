import type {
  locations,
  organizationInvitations,
  organizationMemberships,
  organizations,
  submissions,
} from "@/db/schema";

type OrganizationRow = typeof organizations.$inferSelect;
type LocationRow = typeof locations.$inferSelect;
type MembershipRow = typeof organizationMemberships.$inferSelect;
type InvitationRow = typeof organizationInvitations.$inferSelect;
type SubmissionRow = typeof submissions.$inferSelect;

export function serializeOrganization(org: OrganizationRow) {
  return {
    id: org.id,
    name: org.name,
    primary_language: org.primaryLanguage,
    alert_email: org.alertEmail,
    default_alert_email: org.defaultAlertEmail,
    current_subscription_period_id: org.currentSubscriptionPeriodId,
    billing_status: org.billingStatus,
    owner_user_id: org.ownerUserId,
    clerk_user_id: org.clerkUserId,
    created_at: org.createdAt,
    updated_at: org.updatedAt,
  };
}

export function serializeLocation(location: LocationRow) {
  return {
    id: location.id,
    organization_id: location.organizationId,
    org_id: location.orgId,
    name: location.name,
    tagline: location.tagline,
    cover_image_url: location.coverImageUrl,
    taste_summary: location.tasteSummary,
    taste_themes: location.tasteThemes ?? [],
    public_capture_token: location.publicCaptureToken,
    alert_email_override: location.alertEmailOverride,
    is_active: location.isActive,
    created_at: location.createdAt,
    updated_at: location.updatedAt,
  };
}

export function serializeMembership(membership: MembershipRow) {
  return {
    id: membership.id,
    organization_id: membership.organizationId,
    clerk_user_id: membership.clerkUserId,
    role: membership.role,
    created_at: membership.createdAt,
    updated_at: membership.updatedAt,
  };
}

export function serializeInvitation(invitation: InvitationRow) {
  return {
    id: invitation.id,
    organization_id: invitation.organizationId,
    invited_email: invitation.invitedEmail,
    role: invitation.role,
    token: invitation.token,
    status: invitation.status,
    expires_at: invitation.expiresAt,
    invited_by_clerk_user_id: invitation.invitedByClerkUserId,
    created_at: invitation.createdAt,
    updated_at: invitation.updatedAt,
  };
}

export function serializeSubmission(submission: SubmissionRow) {
  return {
    id: submission.id,
    location_id: submission.locationId,
    organization_id: submission.organizationId,
    status: submission.status,
    audio_storage_path: submission.audioStoragePath,
    audio_retention_consent: submission.audioRetentionConsent,
    original_transcript: submission.originalTranscript,
    transcript: submission.transcript,
    translated_transcript: submission.translatedTranscript,
    english_transcript: submission.englishTranscript,
    summary: submission.summary,
    sentiment: submission.sentiment,
    tags: submission.tags ?? [],
    detected_language: submission.detectedLanguage,
    latest_error: submission.latestError,
    error_message: submission.errorMessage,
    accepted_at: submission.acceptedAt,
    processing_started_at: submission.processingStartedAt,
    created_at: submission.createdAt,
    processed_at: submission.processedAt,
    idempotency_key: submission.idempotencyKey,
    audio_deleted_at: submission.audioDeletedAt,
  };
}
