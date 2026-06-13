CREATE OR REPLACE FUNCTION enqueue_submission_dispatch(
	p_submission_id UUID,
	p_event_type TEXT DEFAULT 'submission/process'
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
	ON CONFLICT ON CONSTRAINT submission_dispatch_outbox_submission_event_key
	DO UPDATE SET
		status = 'pending',
		attempt_count = 0,
		last_error = NULL,
		last_attempt_at = NULL,
		dispatched_at = NULL,
		updated_at = now()
	RETURNING * INTO v_row;

	RETURN QUERY
	SELECT
		v_row.id,
		v_row.submission_id,
		v_row.event_type,
		v_row.status,
		v_row.attempt_count,
		v_row.last_error,
		v_row.last_attempt_at,
		v_row.dispatched_at,
		v_row.created_at,
		v_row.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
