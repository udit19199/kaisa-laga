CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE TABLE "diner_submissions" (
	"diner_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "diner_submissions_diner_id_submission_id_pk" PRIMARY KEY("diner_id","submission_id")
);
--> statement-breakpoint
CREATE TABLE "diners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"display_name" text,
	"onboarding" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"taste_document" text,
	"taste_embedding" vector(768),
	"onboarding_embedding" vector(768),
	"linked_review_count" integer DEFAULT 0 NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "tagline" text;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "cover_image_url" text;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "search_document" text;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "taste_summary" text;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "taste_themes" text[] DEFAULT '{}'::text[];--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "search_embedding" vector(768);--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "preview_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "diner_submissions" ADD CONSTRAINT "diner_submissions_diner_id_diners_id_fk" FOREIGN KEY ("diner_id") REFERENCES "public"."diners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diner_submissions" ADD CONSTRAINT "diner_submissions_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "diner_submissions_submission_id_key" ON "diner_submissions" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "idx_diner_submissions_diner_id" ON "diner_submissions" USING btree ("diner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "diners_clerk_user_id_key" ON "diners" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "idx_diners_clerk_user_id" ON "diners" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "idx_submissions_is_public" ON "submissions" USING btree ("is_public");