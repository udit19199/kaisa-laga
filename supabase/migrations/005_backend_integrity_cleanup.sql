-- PulseDrop backend integrity cleanup
-- Canonical tenant provisioning, durable submission outbox, and retention-aware submission dispatch.

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS audio_retention_consent BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS submission_dispatch_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  last_attempt_at TIMESTAMPTZ,
  dispatched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS submission_dispatch_outbox_submission_event_key
  ON submission_dispatch_outbox (submission_id, event_type);

CREATE INDEX IF NOT EXISTS submission_dispatch_outbox_status_updated_at_key
  ON submission_dispatch_outbox (status, updated_at);

ALTER TABLE submission_dispatch_outbox
  ADD CONSTRAINT submission_dispatch_outbox_status_check
  CHECK (status IN ('pending', 'processing', 'dispatched', 'failed'));

DROP TRIGGER IF EXISTS submission_dispatch_outbox_updated_at ON submission_dispatch_outbox;
CREATE TRIGGER submission_dispatch_outbox_updated_at
  BEFORE UPDATE ON submission_dispatch_outbox
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE OR REPLACE FUNCTION provision_organization(
  p_name TEXT,
  p_clerk_user_id TEXT,
  p_clerk_user_email TEXT DEFAULT NULL,
  p_primary_language TEXT DEFAULT 'en'
)
RETURNS TABLE (
  organization_id UUID,
  membership_id UUID,
  subscription_period_id UUID
) AS $$
DECLARE
  v_plan RECORD;
  v_now TIMESTAMPTZ := now();
  v_next_month TIMESTAMPTZ := now() + INTERVAL '1 month';
BEGIN
  SELECT *
  INTO v_plan
  FROM plans
  WHERE is_active = TRUE
  ORDER BY monthly_review_limit ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active plan configured';
  END IF;

  INSERT INTO organizations (
    name,
    primary_language,
    default_alert_email,
    alert_email,
    billing_status,
    owner_user_id,
    clerk_user_id
  )
  VALUES (
    p_name,
    COALESCE(NULLIF(btrim(p_primary_language), ''), 'en'),
    p_clerk_user_email,
    p_clerk_user_email,
    'active',
    p_clerk_user_id,
    p_clerk_user_id
  )
  RETURNING id INTO organization_id;

  INSERT INTO organization_memberships (
    organization_id,
    clerk_user_id,
    role
  )
  VALUES (
    organization_id,
    p_clerk_user_id,
    'owner'
  )
  RETURNING id INTO membership_id;

  INSERT INTO organization_subscription_periods (
    organization_id,
    plan_id,
    period_start,
    period_end,
    base_review_limit_snapshot,
    effective_review_limit,
    reviews_used,
    status
  )
  VALUES (
    organization_id,
    v_plan.id,
    v_now,
    v_next_month,
    v_plan.monthly_review_limit,
    v_plan.monthly_review_limit,
    0,
    'active'
  )
  RETURNING id INTO subscription_period_id;

  UPDATE organizations
  SET current_subscription_period_id = subscription_period_id
  WHERE id = organization_id;

  RETURN QUERY
  SELECT organization_id, membership_id, subscription_period_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION enqueue_submission_dispatch(
  p_submission_id UUID,
  p_event_type TEXT DEFAULT 'submission/process'
)
RETURNS submission_dispatch_outbox AS $$
DECLARE
  v_row submission_dispatch_outbox%ROWTYPE;
BEGIN
  INSERT INTO submission_dispatch_outbox (
    submission_id,
    event_type,
    status,
    attempt_count,
    last_error,
    last_attempt_at,
    dispatched_at
  )
  VALUES (
    p_submission_id,
    p_event_type,
    'pending',
    0,
    NULL,
    NULL,
    NULL
  )
  ON CONFLICT (submission_id, event_type)
  DO UPDATE SET
    status = 'pending',
    attempt_count = 0,
    last_error = NULL,
    last_attempt_at = NULL,
    dispatched_at = NULL,
    updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION retry_submission_dispatch(
  p_submission_id UUID
)
RETURNS TABLE (
  submission_id UUID,
  dispatch_status TEXT,
  status TEXT
) AS $$
DECLARE
  v_submission RECORD;
  v_outbox RECORD;
BEGIN
  UPDATE submissions
  SET
    status = 'accepted',
    latest_error = NULL,
    error_message = NULL,
    processing_started_at = NULL
  WHERE id = p_submission_id
  RETURNING id INTO v_submission;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  SELECT *
  INTO v_outbox
  FROM enqueue_submission_dispatch(p_submission_id, 'submission/process');

  RETURN QUERY
  SELECT
    v_submission.id,
    v_outbox.status,
    'accepted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION claim_submission_dispatch_outbox(
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  submission_id UUID,
  event_type TEXT,
  status TEXT,
  attempt_count INTEGER,
  last_error TEXT,
  last_attempt_at TIMESTAMPTZ,
  dispatched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH claimed AS (
    SELECT outbox.id
    FROM submission_dispatch_outbox outbox
    WHERE (
      outbox.status IN ('pending', 'failed')
      OR (outbox.status = 'processing' AND outbox.updated_at < now() - INTERVAL '5 minutes')
    )
      AND outbox.attempt_count < 25
    ORDER BY outbox.updated_at ASC, outbox.created_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  UPDATE submission_dispatch_outbox
  SET
    status = 'processing',
    attempt_count = submission_dispatch_outbox.attempt_count + 1,
    last_error = NULL,
    last_attempt_at = now(),
    updated_at = now()
  FROM claimed
  WHERE submission_dispatch_outbox.id = claimed.id
  RETURNING
    submission_dispatch_outbox.id,
    submission_dispatch_outbox.submission_id,
    submission_dispatch_outbox.event_type,
    submission_dispatch_outbox.status,
    submission_dispatch_outbox.attempt_count,
    submission_dispatch_outbox.last_error,
    submission_dispatch_outbox.last_attempt_at,
    submission_dispatch_outbox.dispatched_at,
    submission_dispatch_outbox.created_at,
    submission_dispatch_outbox.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION accept_public_submission(
  p_capture_token TEXT,
  p_submission_id UUID,
  p_idempotency_key TEXT,
  p_audio_storage_path TEXT,
  p_audio_mime_type TEXT DEFAULT NULL,
  p_retention_consent BOOLEAN DEFAULT FALSE
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
  status TEXT,
  dispatch_status TEXT
) AS $$
DECLARE
  v_location RECORD;
  v_period RECORD;
  v_submission RECORD;
  v_existing_event RECORD;
  v_outbox RECORD;
  v_dispatch_status TEXT := 'pending';
  v_idempotency_key TEXT := btrim(p_idempotency_key);
  v_retention_consent BOOLEAN := COALESCE(p_retention_consent, FALSE);
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
  FROM submissions submission
  WHERE submission.organization_id = v_location.organization_id
    AND submission.idempotency_key = v_idempotency_key
  LIMIT 1;

  IF FOUND THEN
    SELECT *
    INTO v_existing_event
    FROM usage_events usage_event
    WHERE usage_event.submission_id = v_submission.id
    LIMIT 1;

    SELECT submission_dispatch.status
    INTO v_dispatch_status
    FROM submission_dispatch_outbox submission_dispatch
    WHERE submission_dispatch.submission_id = v_submission.id
      AND submission_dispatch.event_type = 'submission/process'
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
      v_submission.status::text,
      COALESCE(v_dispatch_status, 'pending')
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
    audio_retention_consent,
    accepted_at,
    idempotency_key
  )
  VALUES (
    p_submission_id,
    v_location.organization_id,
    v_location.location_id,
    'accepted',
    p_audio_storage_path,
    v_retention_consent,
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
  SET reviews_used = organization_subscription_periods.reviews_used + 1
  WHERE organization_subscription_periods.id = v_period.id;

  SELECT *
  INTO v_outbox
  FROM enqueue_submission_dispatch(v_submission.id, 'submission/process');
  v_dispatch_status := v_outbox.status;

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
    v_submission.status::text,
    v_dispatch_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
