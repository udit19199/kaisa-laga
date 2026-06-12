import type { Sentiment, SubmissionStatus, Tag } from "./constants";

export interface Organization {
  id: string;
  name: string;
  primary_language: string;
  alert_email: string | null;
  owner_user_id: string | null;
  clerk_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  org_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  location_id: string;
  status: SubmissionStatus;
  audio_storage_path: string;
  transcript: string | null;
  translated_transcript: string | null;
  summary: string | null;
  sentiment: Sentiment | null;
  tags: Tag[];
  detected_language: string | null;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
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
