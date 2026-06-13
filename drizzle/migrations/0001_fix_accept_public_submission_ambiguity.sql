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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;--> statement-breakpoint
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
