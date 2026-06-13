DROP FUNCTION IF EXISTS enqueue_submission_dispatch(uuid, text);--> statement-breakpoint
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
