DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'organizations'
      AND column_name = 'owner_user_id'
      AND udt_name <> 'text'
  ) THEN
    ALTER TABLE organizations
      ALTER COLUMN owner_user_id TYPE TEXT
      USING owner_user_id::text;
  END IF;
END $$;

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
  description = EXCLUDED.description;
