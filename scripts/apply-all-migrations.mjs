#!/usr/bin/env bun
/**
 * Archived legacy bootstrap for recovering an old pre-Drizzle development
 * database. The normal workflow is now `bun run db:migrate` for fresh
 * databases or `bun run db:baseline` for already-matching ones.
 * Usage:
 *   bun --env-file=.env.local scripts/apply-all-migrations.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { getAdminDatabaseUrl } from "../src/db/credentials";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const connectionString = getAdminDatabaseUrl(process.env);

const hostname = new URL(connectionString).hostname;
const shouldRequireSsl =
  hostname !== "localhost" &&
  hostname !== "127.0.0.1" &&
  hostname !== "::1";

const sql = postgres(connectionString, {
  ssl: shouldRequireSsl ? "require" : undefined,
  prepare: false,
  max: 1,
});

async function tableExists(tableName) {
  const rows = await sql`
    select exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = ${tableName}
    ) as exists
  `;
  return rows[0]?.exists ?? false;
}

async function columnExists(tableName, columnName) {
  const rows = await sql`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = ${tableName}
        and column_name = ${columnName}
    ) as exists
  `;
  return rows[0]?.exists ?? false;
}

async function functionExists(functionName) {
  const rows = await sql`
    select exists (
      select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname = ${functionName}
    ) as exists
  `;
  return rows[0]?.exists ?? false;
}

async function ownerUserIdIsText() {
  const rows = await sql`
    select udt_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'organizations'
      and column_name = 'owner_user_id'
  `;
  return rows[0]?.udt_name === "text";
}

async function hasActivePlan() {
  const plansExists = await tableExists("plans");
  if (!plansExists) {
    return false;
  }

  const rows = await sql`
    select exists (
      select 1
      from public.plans
      where is_active = true
    ) as exists
  `;
  return rows[0]?.exists ?? false;
}

const migrations = [
  {
    path: "supabase/migrations/002_expand_audio_bucket_mime_types.sql",
    shouldApply: async () => true,
  },
  {
    path: "supabase/migrations/002_expand_submission_status_enum.sql",
    shouldApply: async () => true,
  },
  {
    path: "supabase/migrations/003_launch_backend_schema.sql",
    shouldApply: async () =>
      !(await tableExists("organization_memberships")) ||
      !(await tableExists("organization_subscription_periods")) ||
      !(await columnExists("locations", "organization_id")),
  },
  {
    path: "supabase/migrations/003_clerk_auth.sql",
    shouldApply: async () => !(await columnExists("organizations", "clerk_user_id")),
  },
  {
    path: "supabase/migrations/004_add_english_transcript.sql",
    shouldApply: async () => !(await columnExists("submissions", "english_transcript")),
  },
  {
    path: "supabase/migrations/005_backend_integrity_cleanup.sql",
    shouldApply: async () =>
      !(await tableExists("submission_dispatch_outbox")) ||
      !(await functionExists("provision_organization")) ||
      !(await functionExists("accept_public_submission")) ||
      !(await functionExists("retry_submission_dispatch")),
  },
  {
    path: "supabase/migrations/006_align_clerk_owner_and_seed_pilot_plan.sql",
    shouldApply: async () => !(await ownerUserIdIsText()) || !(await hasActivePlan()),
  },
  {
    path: "supabase/migrations/007_sync_location_org_columns.sql",
    shouldApply: async () => true,
  },
];

for (const migration of migrations) {
  const shouldApply = await migration.shouldApply();
  if (!shouldApply) {
    console.log(`Skipping ${migration.path} (already satisfied).`);
    continue;
  }

  const migrationPath = migration.path;
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
console.log("Migration check completed successfully!");
