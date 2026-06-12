#!/usr/bin/env bun
/**
 * Applies all pending migrations (002, launch backend schema, clerk auth) when SUPABASE_DB_PASSWORD is set.
 * Usage:
 *   SUPABASE_DB_PASSWORD='your-db-password' bun --env-file=.env.local scripts/apply-all-migrations.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const password = process.env.SUPABASE_DB_PASSWORD;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!password) {
  console.error("Error: Please set SUPABASE_DB_PASSWORD (Project Settings → Database → password).");
  process.exit(1);
}

if (!supabaseUrl) {
  console.error("Error: Missing NEXT_PUBLIC_SUPABASE_URL.");
  process.exit(1);
}

const ref = new URL(supabaseUrl).hostname.split(".")[0];
const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
const sql = postgres(connectionString, { ssl: "require", max: 1 });

const migrations = [
  "supabase/migrations/002_expand_audio_bucket_mime_types.sql",
  "supabase/migrations/003_launch_backend_schema.sql",
  "supabase/migrations/003_clerk_auth.sql"
];

for (const migrationPath of migrations) {
  const sqlFile = resolve(root, migrationPath);
  console.log(`Reading ${migrationPath}...`);
  try {
    const migrationSql = readFileSync(sqlFile, "utf8");
    console.log(`Applying ${migrationPath}...`);
    await sql.unsafe(migrationSql);
    console.log(`✓ Successfully applied ${migrationPath}\n`);
  } catch (error) {
    console.error(`✗ Failed to apply ${migrationPath}:`, error instanceof Error ? error.message : error);
    await sql.end();
    process.exit(1);
  }
}

await sql.end();
console.log("All migrations applied successfully!");
