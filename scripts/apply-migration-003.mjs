#!/usr/bin/env bun
/**
 * Apply migration 003 when SUPABASE_DB_PASSWORD is set (database password from Supabase dashboard).
 * Usage:
 *   SUPABASE_DB_PASSWORD='your-db-password' bun --env-file=.env.local scripts/apply-migration-003.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const password = process.env.SUPABASE_DB_PASSWORD;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!password) {
  console.error(
    "Set SUPABASE_DB_PASSWORD (Project Settings → Database → password) and re-run.",
  );
  process.exit(1);
}

if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

const ref = new URL(supabaseUrl).hostname.split(".")[0];
const sqlFile = resolve(root, "supabase/migrations/003_clerk_auth.sql");
const migrationSql = readFileSync(sqlFile, "utf8");

const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;

const sql = postgres(connectionString, { ssl: "require", max: 1 });

try {
  await sql.unsafe(migrationSql);
  console.log("Applied migration 003_clerk_auth.sql");
} catch (error) {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await sql.end();
}
