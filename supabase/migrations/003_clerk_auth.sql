-- Migrate operator identity from Supabase Auth to Clerk

ALTER TABLE organizations
  DROP CONSTRAINT IF EXISTS organizations_owner_user_id_fkey;

ALTER TABLE organizations
  ALTER COLUMN owner_user_id DROP NOT NULL;

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_organizations_clerk_user_id
  ON organizations (clerk_user_id);
