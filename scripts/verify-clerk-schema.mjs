/**
 * Verifies migration 003 (clerk_user_id on organizations) is applied.
 * Run: bun --env-file=.env.local scripts/verify-clerk-schema.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error } = await admin.from("organizations").select("clerk_user_id").limit(1);

if (error) {
  console.error("Migration 003 NOT applied:", error.message);
  console.error("Run supabase/migrations/003_clerk_auth.sql in the Supabase SQL Editor.");
  process.exit(1);
}

console.log("OK: organizations.clerk_user_id exists");
