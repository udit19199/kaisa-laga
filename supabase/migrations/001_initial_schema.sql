-- Kaisa Laga initial schema

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  primary_language TEXT NOT NULL DEFAULT 'en',
  alert_email TEXT,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Locations
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_locations_org_id ON locations(org_id);

-- Submissions
CREATE TYPE submission_status AS ENUM ('pending', 'processed', 'failed');
CREATE TYPE sentiment_type AS ENUM ('Positive', 'Neutral', 'Negative');

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  status submission_status NOT NULL DEFAULT 'pending',
  audio_storage_path TEXT NOT NULL,
  transcript TEXT,
  translated_transcript TEXT,
  summary TEXT,
  sentiment sentiment_type,
  tags TEXT[] DEFAULT '{}',
  detected_language TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_submissions_location_id ON submissions(location_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Storage bucket for audio
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'submissions-audio',
  'submissions-audio',
  false,
  5242880,
  ARRAY[
    'audio/webm',
    'audio/ogg',
    'audio/mp4',
    'audio/mpeg',
    'audio/wav',
    'video/mp4',
    'audio/aac',
    'audio/x-m4a',
    'audio/mp4;codecs=mp4a'
  ]
);

-- RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Organizations: owner can read/write their org
CREATE POLICY org_select ON organizations
  FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY org_insert ON organizations
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY org_update ON organizations
  FOR UPDATE USING (auth.uid() = owner_user_id);

-- Locations: org owner access
CREATE POLICY location_select ON locations
  FOR SELECT USING (
    org_id IN (SELECT id FROM organizations WHERE owner_user_id = auth.uid())
  );

CREATE POLICY location_insert ON locations
  FOR INSERT WITH CHECK (
    org_id IN (SELECT id FROM organizations WHERE owner_user_id = auth.uid())
  );

CREATE POLICY location_update ON locations
  FOR UPDATE USING (
    org_id IN (SELECT id FROM organizations WHERE owner_user_id = auth.uid())
  );

CREATE POLICY location_delete ON locations
  FOR DELETE USING (
    org_id IN (SELECT id FROM organizations WHERE owner_user_id = auth.uid())
  );

-- Submissions: org owner via location join
CREATE POLICY submission_select ON submissions
  FOR SELECT USING (
    location_id IN (
      SELECT l.id FROM locations l
      JOIN organizations o ON l.org_id = o.id
      WHERE o.owner_user_id = auth.uid()
    )
  );

-- Public insert for customer capture (via service role in API)
-- Service role bypasses RLS for submission creation

-- Storage policies: service role handles uploads; authenticated users read own org audio
CREATE POLICY audio_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'submissions-audio'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] IN (
      SELECT l.id::text FROM locations l
      JOIN organizations o ON l.org_id = o.id
      WHERE o.owner_user_id = auth.uid()
    )
  );
