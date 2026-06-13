CREATE EXTENSION IF NOT EXISTS pgcrypto;--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."membership_role" AS ENUM('owner', 'manager', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."sentiment_type" AS ENUM('Positive', 'Neutral', 'Negative');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('pending', 'processed', 'failed', 'accepted', 'processing', 'terminal_failed');--> statement-breakpoint
CREATE TYPE "public"."subscription_period_status" AS ENUM('active', 'scheduled', 'closed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."usage_event_type" AS ENUM('billable_acceptance');--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"public_capture_token" text NOT NULL,
	"alert_email_override" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"invited_email" text NOT NULL,
	"role" "membership_role" DEFAULT 'viewer' NOT NULL,
	"token" text NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"invited_by_clerk_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "organization_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"clerk_user_id" text NOT NULL,
	"role" "membership_role" DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_subscription_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"base_review_limit_snapshot" integer NOT NULL,
	"effective_review_limit" integer NOT NULL,
	"reviews_used" integer DEFAULT 0 NOT NULL,
	"status" "subscription_period_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"primary_language" text DEFAULT 'en' NOT NULL,
	"alert_email" text,
	"default_alert_email" text,
	"current_subscription_period_id" uuid,
	"billing_status" text DEFAULT 'active' NOT NULL,
	"deletion_requested_at" timestamp with time zone,
	"deletion_scheduled_at" timestamp with time zone,
	"owner_user_id" text,
	"clerk_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"monthly_review_limit" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plans_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "submission_dispatch_outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"last_attempt_at" timestamp with time zone,
	"dispatched_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submission_dispatch_outbox_status_check" CHECK ("submission_dispatch_outbox"."status" in ('pending', 'processing', 'dispatched', 'failed'))
);
--> statement-breakpoint
CREATE TABLE "submission_processing_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"attempt_number" integer NOT NULL,
	"stage" text NOT NULL,
	"provider" text,
	"model" text,
	"status" text NOT NULL,
	"error_message" text,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_tags" (
	"submission_id" uuid NOT NULL,
	"tag" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submission_tags_submission_id_tag_pk" PRIMARY KEY("submission_id","tag")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"status" "submission_status" DEFAULT 'accepted' NOT NULL,
	"audio_storage_path" text NOT NULL,
	"audio_retention_consent" boolean DEFAULT false NOT NULL,
	"original_transcript" text,
	"transcript" text,
	"translated_transcript" text,
	"english_transcript" text,
	"summary" text,
	"sentiment" "sentiment_type",
	"tags" text[] DEFAULT '{}'::text[],
	"detected_language" text,
	"latest_error" text,
	"error_message" text,
	"accepted_at" timestamp with time zone DEFAULT now(),
	"processing_started_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"idempotency_key" text,
	"audio_deleted_at" timestamp with time zone,
	CONSTRAINT "submissions_idempotency_key_not_blank" CHECK ("submissions"."idempotency_key" is null or length(btrim("submissions"."idempotency_key")) > 0)
);
--> statement-breakpoint
CREATE TABLE "usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"subscription_period_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"event_type" "usage_event_type" NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_subscription_periods" ADD CONSTRAINT "organization_subscription_periods_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_subscription_periods" ADD CONSTRAINT "organization_subscription_periods_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_dispatch_outbox" ADD CONSTRAINT "submission_dispatch_outbox_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_processing_attempts" ADD CONSTRAINT "submission_processing_attempts_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_tags" ADD CONSTRAINT "submission_tags_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_subscription_period_id_organization_subscription_periods_id_fk" FOREIGN KEY ("subscription_period_id") REFERENCES "public"."organization_subscription_periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_locations_org_id" ON "locations" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "locations_public_capture_token_key" ON "locations" USING btree ("public_capture_token") WHERE "locations"."public_capture_token" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_invitations_org_email_pending_key" ON "organization_invitations" USING btree ("organization_id","invited_email") WHERE "organization_invitations"."status" = 'pending';--> statement-breakpoint
CREATE UNIQUE INDEX "organization_memberships_organization_id_clerk_user_id_key" ON "organization_memberships" USING btree ("organization_id","clerk_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_memberships_clerk_user_id_key" ON "organization_memberships" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_subscription_periods_active_key" ON "organization_subscription_periods" USING btree ("organization_id") WHERE "organization_subscription_periods"."status" = 'active';--> statement-breakpoint
CREATE INDEX "idx_organizations_clerk_user_id" ON "organizations" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_clerk_user_id_key" ON "organizations" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_current_subscription_period_id_key" ON "organizations" USING btree ("current_subscription_period_id") WHERE "organizations"."current_subscription_period_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "submission_dispatch_outbox_submission_event_key" ON "submission_dispatch_outbox" USING btree ("submission_id","event_type");--> statement-breakpoint
CREATE INDEX "submission_dispatch_outbox_status_updated_at_key" ON "submission_dispatch_outbox" USING btree ("status","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "submission_processing_attempts_submission_attempt_key" ON "submission_processing_attempts" USING btree ("submission_id","attempt_number");--> statement-breakpoint
CREATE INDEX "idx_submissions_location_id" ON "submissions" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "idx_submissions_status" ON "submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_submissions_created_at" ON "submissions" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "submissions_org_idempotency_key_key" ON "submissions" USING btree ("organization_id","idempotency_key") WHERE "submissions"."idempotency_key" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "usage_events_submission_id_key" ON "usage_events" USING btree ("submission_id");
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
	'submissions-audio',
	'submissions-audio',
	false,
	5242880,
	ARRAY[
		'audio/webm',
		'audio/webm;codecs=opus',
		'audio/webm;codecs=vorbis',
		'audio/ogg',
		'audio/mp4',
		'audio/mpeg',
		'audio/wav',
		'video/mp4',
		'audio/aac',
		'audio/x-m4a',
		'audio/mp4;codecs=mp4a'
	]
)
ON CONFLICT (id)
DO UPDATE SET
	name = EXCLUDED.name,
	public = EXCLUDED.public,
	file_size_limit = EXCLUDED.file_size_limit,
	allowed_mime_types = EXCLUDED.allowed_mime_types;--> statement-breakpoint
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE OR REPLACE FUNCTION current_actor_id()
RETURNS TEXT AS $$
	SELECT nullif(current_setting('request.jwt.claim.sub', true), '');
$$ LANGUAGE sql STABLE;--> statement-breakpoint
CREATE OR REPLACE FUNCTION organization_member_role(p_organization_id UUID)
RETURNS TEXT AS $$
	SELECT membership.role::text
	FROM organization_memberships membership
	WHERE membership.organization_id = p_organization_id
		AND membership.clerk_user_id = current_actor_id()
	LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;--> statement-breakpoint
CREATE OR REPLACE FUNCTION organization_has_role(p_organization_id UUID, p_roles TEXT[])
RETURNS BOOLEAN AS $$
	SELECT EXISTS (
		SELECT 1
		FROM organization_memberships membership
		WHERE membership.organization_id = p_organization_id
			AND membership.clerk_user_id = current_actor_id()
			AND membership.role::text = ANY (p_roles)
	);
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;--> statement-breakpoint
CREATE OR REPLACE FUNCTION organization_is_member(p_organization_id UUID)
RETURNS BOOLEAN AS $$
	SELECT EXISTS (
		SELECT 1
		FROM organization_memberships membership
		WHERE membership.organization_id = p_organization_id
			AND membership.clerk_user_id = current_actor_id()
	);
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;--> statement-breakpoint
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
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE OR REPLACE FUNCTION sync_location_org_columns()
RETURNS TRIGGER AS $$
BEGIN
	NEW.organization_id = COALESCE(NEW.organization_id, NEW.org_id);
	NEW.org_id = COALESCE(NEW.org_id, NEW.organization_id);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;--> statement-breakpoint
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;--> statement-breakpoint
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;--> statement-breakpoint
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;--> statement-breakpoint
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;--> statement-breakpoint
INSERT INTO plans (
	code,
	name,
	monthly_review_limit,
	is_active,
	description
)
VALUES (
	'pilot',
	'Pilot',
	500,
	TRUE,
	'Default pilot plan for pre-launch onboarding.'
)
ON CONFLICT (code)
DO UPDATE SET
	name = EXCLUDED.name,
	monthly_review_limit = EXCLUDED.monthly_review_limit,
	is_active = TRUE,
	description = EXCLUDED.description;--> statement-breakpoint
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE organization_subscription_periods ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE submission_tags ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE submission_processing_attempts ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY organizations_select_member ON organizations
	FOR SELECT USING (organization_is_member(id));--> statement-breakpoint
CREATE POLICY organizations_update_owner ON organizations
	FOR UPDATE USING (organization_has_role(id, ARRAY['owner']));--> statement-breakpoint
CREATE POLICY locations_select_member ON locations
	FOR SELECT USING (organization_is_member(organization_id));--> statement-breakpoint
CREATE POLICY locations_insert_owner_manager ON locations
	FOR INSERT WITH CHECK (organization_has_role(organization_id, ARRAY['owner', 'manager']));--> statement-breakpoint
CREATE POLICY locations_update_owner_manager ON locations
	FOR UPDATE USING (organization_has_role(organization_id, ARRAY['owner', 'manager']));--> statement-breakpoint
CREATE POLICY locations_delete_owner_manager ON locations
	FOR DELETE USING (organization_has_role(organization_id, ARRAY['owner', 'manager']));--> statement-breakpoint
CREATE POLICY submissions_select_member ON submissions
	FOR SELECT USING (organization_is_member(organization_id));--> statement-breakpoint
CREATE POLICY plans_select_authenticated ON plans
	FOR SELECT USING (current_actor_id() IS NOT NULL);--> statement-breakpoint
CREATE POLICY memberships_select_member ON organization_memberships
	FOR SELECT USING (organization_is_member(organization_id));--> statement-breakpoint
CREATE POLICY memberships_manage_owner ON organization_memberships
	FOR ALL USING (organization_has_role(organization_id, ARRAY['owner']))
	WITH CHECK (organization_has_role(organization_id, ARRAY['owner']));--> statement-breakpoint
CREATE POLICY invitations_select_member ON organization_invitations
	FOR SELECT USING (organization_is_member(organization_id));--> statement-breakpoint
CREATE POLICY invitations_manage_owner ON organization_invitations
	FOR ALL USING (organization_has_role(organization_id, ARRAY['owner']))
	WITH CHECK (organization_has_role(organization_id, ARRAY['owner']));--> statement-breakpoint
CREATE POLICY periods_select_member ON organization_subscription_periods
	FOR SELECT USING (organization_is_member(organization_id));--> statement-breakpoint
CREATE POLICY tags_select_member ON submission_tags
	FOR SELECT USING (
		EXISTS (
			SELECT 1
			FROM submissions submission
			WHERE submission.id = submission_tags.submission_id
				AND organization_is_member(submission.organization_id)
		)
	);--> statement-breakpoint
CREATE POLICY attempts_select_member ON submission_processing_attempts
	FOR SELECT USING (
		EXISTS (
			SELECT 1
			FROM submissions submission
			WHERE submission.id = submission_processing_attempts.submission_id
				AND organization_is_member(submission.organization_id)
		)
	);--> statement-breakpoint
CREATE POLICY usage_events_select_member ON usage_events
	FOR SELECT USING (organization_is_member(organization_id));--> statement-breakpoint
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
	);--> statement-breakpoint
DROP TRIGGER IF EXISTS locations_sync_org_columns ON locations;--> statement-breakpoint
CREATE TRIGGER locations_sync_org_columns
	BEFORE INSERT OR UPDATE ON locations
	FOR EACH ROW EXECUTE FUNCTION sync_location_org_columns();--> statement-breakpoint
DROP TRIGGER IF EXISTS submission_tags_sync_cache_insert ON submission_tags;--> statement-breakpoint
CREATE TRIGGER submission_tags_sync_cache_insert
	AFTER INSERT OR DELETE OR UPDATE ON submission_tags
	FOR EACH ROW EXECUTE FUNCTION sync_submission_tag_cache();--> statement-breakpoint
DROP TRIGGER IF EXISTS organizations_updated_at ON organizations;--> statement-breakpoint
CREATE TRIGGER organizations_updated_at
	BEFORE UPDATE ON organizations
	FOR EACH ROW EXECUTE FUNCTION touch_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS locations_updated_at ON locations;--> statement-breakpoint
CREATE TRIGGER locations_updated_at
	BEFORE UPDATE ON locations
	FOR EACH ROW EXECUTE FUNCTION touch_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS plans_updated_at ON plans;--> statement-breakpoint
CREATE TRIGGER plans_updated_at
	BEFORE UPDATE ON plans
	FOR EACH ROW EXECUTE FUNCTION touch_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS organization_memberships_updated_at ON organization_memberships;--> statement-breakpoint
CREATE TRIGGER organization_memberships_updated_at
	BEFORE UPDATE ON organization_memberships
	FOR EACH ROW EXECUTE FUNCTION touch_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS organization_invitations_updated_at ON organization_invitations;--> statement-breakpoint
CREATE TRIGGER organization_invitations_updated_at
	BEFORE UPDATE ON organization_invitations
	FOR EACH ROW EXECUTE FUNCTION touch_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS organization_subscription_periods_updated_at ON organization_subscription_periods;--> statement-breakpoint
CREATE TRIGGER organization_subscription_periods_updated_at
	BEFORE UPDATE ON organization_subscription_periods
	FOR EACH ROW EXECUTE FUNCTION touch_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS submission_processing_attempts_updated_at ON submission_processing_attempts;--> statement-breakpoint
CREATE TRIGGER submission_processing_attempts_updated_at
	BEFORE UPDATE ON submission_processing_attempts
	FOR EACH ROW EXECUTE FUNCTION touch_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS submission_dispatch_outbox_updated_at ON submission_dispatch_outbox;--> statement-breakpoint
CREATE TRIGGER submission_dispatch_outbox_updated_at
	BEFORE UPDATE ON submission_dispatch_outbox
	FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
