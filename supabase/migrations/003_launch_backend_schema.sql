-- PulseDrop launch backend schema
-- Additive migration that keeps legacy columns available while introducing the
-- normalized org, membership, subscription, and quota ledger model.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION current_actor_id()
RETURNS TEXT AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '');
$$ LANGUAGE sql STABLE;

-- ---------------------------------------------------------------------------
-- Core tenant / billing tables
-- ---------------------------------------------------------------------------

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS default_alert_email TEXT,
  ADD COLUMN IF NOT EXISTS current_subscription_period_id UUID,
  ADD COLUMN IF NOT EXISTS billing_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMPTZ;

ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS public_capture_token TEXT,
  ADD COLUMN IF NOT EXISTS alert_email_override TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS original_transcript TEXT,
  ADD COLUMN IF NOT EXISTS latest_error TEXT,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS audio_deleted_at TIMESTAMPTZ;

UPDATE organizations
SET default_alert_email = COALESCE(default_alert_email, alert_email)
WHERE default_alert_email IS NULL;

UPDATE locations
SET organization_id = COALESCE(organization_id, org_id)
WHERE organization_id IS NULL;

UPDATE submissions
SET organization_id = COALESCE(submissions.organization_id, locations.organization_id),
    original_transcript = COALESCE(original_transcript, transcript),
    latest_error = COALESCE(latest_error, error_message),
    accepted_at = COALESCE(accepted_at, submissions.created_at)
FROM locations
WHERE submissions.location_id = locations.id
  AND submissions.organization_id IS NULL;

ALTER TABLE locations
  ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE submissions
  ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE submissions
  ALTER COLUMN accepted_at SET DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS organizations_current_subscription_period_id_key
  ON organizations (current_subscription_period_id)
  WHERE current_subscription_period_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS locations_public_capture_token_key
  ON locations (public_capture_token)
  WHERE public_capture_token IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS submissions_org_idempotency_key_key
  ON submissions (organization_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE locations
  ADD CONSTRAINT locations_organization_id_fkey
  FOREIGN KEY (organization_id)
  REFERENCES organizations(id)
  ON DELETE CASCADE
  NOT VALID;

ALTER TABLE submissions
  ADD CONSTRAINT submissions_organization_id_fkey
  FOREIGN KEY (organization_id)
  REFERENCES organizations(id)
  ON DELETE CASCADE
  NOT VALID;

ALTER TABLE submissions
  ADD CONSTRAINT submissions_idempotency_key_not_blank
  CHECK (idempotency_key IS NULL OR length(btrim(idempotency_key)) > 0);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_role') THEN
    CREATE TYPE membership_role AS ENUM ('owner', 'manager', 'viewer');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_status') THEN
    CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'revoked', 'expired');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_period_status') THEN
    CREATE TYPE subscription_period_status AS ENUM ('active', 'scheduled', 'closed', 'canceled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'usage_event_type') THEN
    CREATE TYPE usage_event_type AS ENUM ('billable_acceptance');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  monthly_review_limit INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  role membership_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS organization_memberships_organization_id_clerk_user_id_key
  ON organization_memberships (organization_id, clerk_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS organization_memberships_clerk_user_id_key
  ON organization_memberships (clerk_user_id);

CREATE OR REPLACE FUNCTION organization_member_role(p_organization_id UUID)
RETURNS TEXT AS $$
  SELECT membership.role::text
  FROM organization_memberships membership
  WHERE membership.organization_id = p_organization_id
    AND membership.clerk_user_id = current_actor_id()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION organization_has_role(p_organization_id UUID, p_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_memberships membership
    WHERE membership.organization_id = p_organization_id
      AND membership.clerk_user_id = current_actor_id()
      AND membership.role::text = ANY (p_roles)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION organization_is_member(p_organization_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_memberships membership
    WHERE membership.organization_id = p_organization_id
      AND membership.clerk_user_id = current_actor_id()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  role membership_role NOT NULL DEFAULT 'viewer',
  token TEXT NOT NULL UNIQUE,
  status invitation_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  invited_by_clerk_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS organization_invitations_org_email_pending_key
  ON organization_invitations (organization_id, invited_email)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS organization_subscription_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  base_review_limit_snapshot INTEGER NOT NULL,
  effective_review_limit INTEGER NOT NULL,
  reviews_used INTEGER NOT NULL DEFAULT 0,
  status subscription_period_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS organization_subscription_periods_active_key
  ON organization_subscription_periods (organization_id)
  WHERE status = 'active';

ALTER TABLE organizations
  ADD CONSTRAINT organizations_current_subscription_period_fkey
  FOREIGN KEY (current_subscription_period_id)
  REFERENCES organization_subscription_periods(id)
  ON DELETE SET NULL
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS submission_tags (
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (submission_id, tag)
);

CREATE TABLE IF NOT EXISTS submission_processing_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  stage TEXT NOT NULL,
  provider TEXT,
  model TEXT,
  status TEXT NOT NULL,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS submission_processing_attempts_submission_attempt_key
  ON submission_processing_attempts (submission_id, attempt_number);

CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_period_id UUID NOT NULL REFERENCES organization_subscription_periods(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  event_type usage_event_type NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS usage_events_submission_id_key
  ON usage_events (submission_id);

-- Backfill members for legacy owners so existing orgs remain reachable.
INSERT INTO organization_memberships (organization_id, clerk_user_id, role)
SELECT id, owner_user_id::text, 'owner'
FROM organizations
WHERE owner_user_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Ensure public capture tokens exist for existing locations.
UPDATE locations
SET public_capture_token = COALESCE(public_capture_token, gen_random_uuid()::text)
WHERE public_capture_token IS NULL;

ALTER TABLE locations
  ALTER COLUMN public_capture_token SET NOT NULL;

ALTER TABLE submissions
  ALTER COLUMN status SET DEFAULT 'accepted';

-- Keep the compatibility cache in sync when new processing writes to the normalized tags table.
CREATE OR REPLACE FUNCTION sync_submission_tag_cache()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE submissions
  SET tags = (
    SELECT COALESCE(array_agg(tag ORDER BY tag), '{}'::text[])
    FROM submission_tags
    WHERE submission_id = COALESCE(NEW.submission_id, OLD.submission_id)
  )
  WHERE id = COALESCE(NEW.submission_id, OLD.submission_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS submission_tags_sync_cache_insert ON submission_tags;
CREATE TRIGGER submission_tags_sync_cache_insert
  AFTER INSERT OR DELETE OR UPDATE ON submission_tags
  FOR EACH ROW EXECUTE FUNCTION sync_submission_tag_cache();

CREATE OR REPLACE FUNCTION accept_public_submission(
  p_capture_token TEXT,
  p_submission_id UUID,
  p_idempotency_key TEXT,
  p_audio_storage_path TEXT,
  p_audio_mime_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  submission_id UUID,
  organization_id UUID,
  location_id UUID,
  subscription_period_id UUID,
  billable_event_id UUID,
  created_new BOOLEAN,
  reviews_used INTEGER,
  effective_review_limit INTEGER,
  status TEXT
) AS $$
DECLARE
  v_location RECORD;
  v_period RECORD;
  v_submission RECORD;
  v_existing_event RECORD;
  v_idempotency_key TEXT := btrim(p_idempotency_key);
BEGIN
  IF v_idempotency_key IS NULL OR v_idempotency_key = '' THEN
    RAISE EXCEPTION 'Idempotency key is required';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(coalesce(p_capture_token, '') || ':' || v_idempotency_key));

  SELECT
    l.id AS location_id,
    l.organization_id,
    l.is_active,
    o.billing_status
  INTO v_location
  FROM locations l
  JOIN organizations o ON o.id = l.organization_id
  WHERE l.public_capture_token = p_capture_token
    AND l.is_active = TRUE
    AND o.billing_status IN ('active', 'trialing')
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or inactive capture token';
  END IF;

  SELECT *
  INTO v_submission
  FROM submissions
  WHERE organization_id = v_location.organization_id
    AND idempotency_key = v_idempotency_key
  LIMIT 1;

  IF FOUND THEN
    SELECT *
    INTO v_existing_event
    FROM usage_events
    WHERE submission_id = v_submission.id
    LIMIT 1;

    RETURN QUERY
    SELECT
      v_submission.id,
      v_submission.organization_id,
      v_submission.location_id,
      v_existing_event.subscription_period_id,
      v_existing_event.id,
      FALSE,
      sp.reviews_used,
      sp.effective_review_limit,
      v_submission.status::text
    FROM organization_subscription_periods sp
    WHERE sp.id = v_existing_event.subscription_period_id;
    RETURN;
  END IF;

  SELECT *
  INTO v_period
  FROM organization_subscription_periods sp
  WHERE sp.organization_id = v_location.organization_id
    AND sp.status = 'active'
  ORDER BY sp.period_start DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active subscription period configured';
  END IF;

  IF v_period.reviews_used >= v_period.effective_review_limit THEN
    RAISE EXCEPTION 'Review cap reached';
  END IF;

  INSERT INTO submissions (
    id,
    organization_id,
    location_id,
    status,
    audio_storage_path,
    accepted_at,
    idempotency_key
  )
  VALUES (
    p_submission_id,
    v_location.organization_id,
    v_location.location_id,
    'accepted',
    p_audio_storage_path,
    now(),
    v_idempotency_key
  )
  RETURNING * INTO v_submission;

  INSERT INTO usage_events (
    organization_id,
    subscription_period_id,
    submission_id,
    event_type,
    quantity
  )
  VALUES (
    v_location.organization_id,
    v_period.id,
    v_submission.id,
    'billable_acceptance',
    1
  )
  RETURNING id INTO v_existing_event;

  UPDATE organization_subscription_periods
  SET reviews_used = reviews_used + 1
  WHERE id = v_period.id;

  RETURN QUERY
  SELECT
    v_submission.id,
    v_submission.organization_id,
    v_submission.location_id,
    v_period.id,
    v_existing_event.id,
    TRUE,
    v_period.reviews_used + 1,
    v_period.effective_review_limit,
    v_submission.status::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION rotate_location_capture_token(p_location_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT := gen_random_uuid()::text;
BEGIN
  UPDATE locations
  SET public_capture_token = v_token
  WHERE id = p_location_id
  RETURNING public_capture_token INTO v_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Location not found';
  END IF;

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------------
-- RLS policies
-- ---------------------------------------------------------------------------

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_subscription_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_processing_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS org_select ON organizations;
DROP POLICY IF EXISTS org_insert ON organizations;
DROP POLICY IF EXISTS org_update ON organizations;
DROP POLICY IF EXISTS location_select ON locations;
DROP POLICY IF EXISTS location_insert ON locations;
DROP POLICY IF EXISTS location_update ON locations;
DROP POLICY IF EXISTS location_delete ON locations;
DROP POLICY IF EXISTS submission_select ON submissions;
DROP POLICY IF EXISTS audio_select ON storage.objects;

CREATE POLICY organizations_select_member ON organizations
  FOR SELECT USING (organization_is_member(id));

CREATE POLICY organizations_update_owner ON organizations
  FOR UPDATE USING (organization_has_role(id, ARRAY['owner']));

CREATE POLICY locations_select_member ON locations
  FOR SELECT USING (organization_is_member(organization_id));

CREATE POLICY locations_insert_owner_manager ON locations
  FOR INSERT WITH CHECK (organization_has_role(organization_id, ARRAY['owner', 'manager']));

CREATE POLICY locations_update_owner_manager ON locations
  FOR UPDATE USING (organization_has_role(organization_id, ARRAY['owner', 'manager']));

CREATE POLICY locations_delete_owner_manager ON locations
  FOR DELETE USING (organization_has_role(organization_id, ARRAY['owner', 'manager']));

CREATE POLICY submissions_select_member ON submissions
  FOR SELECT USING (organization_is_member(organization_id));

CREATE POLICY plans_select_authenticated ON plans
  FOR SELECT USING (current_actor_id() IS NOT NULL);

CREATE POLICY memberships_select_member ON organization_memberships
  FOR SELECT USING (organization_is_member(organization_id));

CREATE POLICY memberships_manage_owner ON organization_memberships
  FOR ALL USING (organization_has_role(organization_id, ARRAY['owner']))
  WITH CHECK (organization_has_role(organization_id, ARRAY['owner']));

CREATE POLICY invitations_select_member ON organization_invitations
  FOR SELECT USING (organization_is_member(organization_id));

CREATE POLICY invitations_manage_owner ON organization_invitations
  FOR ALL USING (organization_has_role(organization_id, ARRAY['owner']))
  WITH CHECK (organization_has_role(organization_id, ARRAY['owner']));

CREATE POLICY periods_select_member ON organization_subscription_periods
  FOR SELECT USING (organization_is_member(organization_id));

CREATE POLICY tags_select_member ON submission_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM submissions submission
      WHERE submission.id = submission_tags.submission_id
        AND organization_is_member(submission.organization_id)
    )
  );

CREATE POLICY attempts_select_member ON submission_processing_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM submissions submission
      WHERE submission.id = submission_processing_attempts.submission_id
        AND organization_is_member(submission.organization_id)
    )
  );

CREATE POLICY usage_events_select_member ON usage_events
  FOR SELECT USING (organization_is_member(organization_id));

CREATE POLICY audio_select_member ON storage.objects
  FOR SELECT USING (
    bucket_id = 'submissions-audio'
    AND EXISTS (
      SELECT 1
      FROM locations location
      JOIN organizations organization ON organization.id = location.organization_id
      WHERE (storage.foldername(storage.objects.name))[1] = location.id::text
        AND organization_is_member(organization.id)
    )
  );

-- ---------------------------------------------------------------------------
-- Updated_at triggers for the new tables
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS organizations_updated_at ON organizations;
CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS locations_updated_at ON locations;
CREATE TRIGGER locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS plans_updated_at ON plans;
CREATE TRIGGER plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS organization_memberships_updated_at ON organization_memberships;
CREATE TRIGGER organization_memberships_updated_at
  BEFORE UPDATE ON organization_memberships
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS organization_invitations_updated_at ON organization_invitations;
CREATE TRIGGER organization_invitations_updated_at
  BEFORE UPDATE ON organization_invitations
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS organization_subscription_periods_updated_at ON organization_subscription_periods;
CREATE TRIGGER organization_subscription_periods_updated_at
  BEFORE UPDATE ON organization_subscription_periods
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS submission_processing_attempts_updated_at ON submission_processing_attempts;
CREATE TRIGGER submission_processing_attempts_updated_at
  BEFORE UPDATE ON submission_processing_attempts
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
