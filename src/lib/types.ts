import type { Sentiment, SubmissionStatus, Tag } from "./constants";

export interface Organization {
  id: string;
  name: string;
  primary_language: string;
  alert_email: string | null;
  default_alert_email?: string | null;
  current_subscription_period_id?: string | null;
  billing_status?: string;
  owner_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  organization_id: string;
  name: string;
  tagline?: string | null;
  cover_image_url?: string | null;
  taste_summary?: string | null;
  taste_themes?: string[];
  public_capture_token?: string;
  alert_email_override?: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  location_id: string;
  organization_id: string;
  status: SubmissionStatus;
  audio_storage_path: string;
  audio_retention_consent: boolean;
  original_transcript?: string | null;
  transcript: string | null;
  translated_transcript: string | null;
  english_transcript?: string | null;
  summary: string | null;
  sentiment: Sentiment | null;
  tags: Tag[];
  detected_language: string | null;
  latest_error?: string | null;
  error_message: string | null;
  accepted_at?: string | null;
  processing_started_at?: string | null;
  created_at: string;
  processed_at: string | null;
  audio_deleted_at?: string | null;
}

export interface SubmissionWithLocation extends Submission {
  location: Pick<Location, "id" | "name">;
}

export interface CategorizationResult {
  sentiment: Sentiment;
  tags: Tag[];
  summary: string;
}

export interface AlertEvaluation {
  shouldAlert: boolean;
  matchedKeywords: string[];
}

export interface AlertPayload {
  locationName: string;
  transcript: string;
  tags: Tag[];
  timestamp: string;
  dashboardUrl: string;
}
