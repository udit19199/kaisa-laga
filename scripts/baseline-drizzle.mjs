#!/usr/bin/env bun
/**
 * Marks the current Drizzle migration journal as already applied in a database
 * that was bootstrapped through the legacy Supabase SQL migrations.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { getAdminDatabaseUrl } from "../src/db/credentials";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const journalPath = resolve(root, "drizzle/migrations/meta/_journal.json");
const journal = JSON.parse(readFileSync(journalPath, "utf8"));
const allMigrations = journal.entries ?? [];
const baselineTag =
  process.env.DRIZZLE_BASELINE_TAG?.trim() || allMigrations[0]?.tag || null;
const migrations = baselineTag
  ? allMigrations.filter((migration) => migration.tag === baselineTag)
  : [];

if (migrations.length === 0) {
  console.log("No Drizzle baseline migration found to record.");
  process.exit(0);
}

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

try {
  await sql`create schema if not exists "drizzle"`;
  await sql`
    create table if not exists "drizzle"."__drizzle_migrations" (
      id serial primary key,
      hash text not null,
      created_at bigint
    )
  `;

  for (const migration of migrations) {
    const migrationFile = resolve(root, `drizzle/migrations/${migration.tag}.sql`);
    const query = readFileSync(migrationFile, "utf8");
    const hash = createHash("sha256").update(query).digest("hex");

    const existing = await sql`
      select 1
      from "drizzle"."__drizzle_migrations"
      where created_at = ${migration.when}
      limit 1
    `;

    if (existing.length > 0) {
      console.log(`Skipping baseline for ${migration.tag} (already recorded).`);
      continue;
    }

    await sql`
      insert into "drizzle"."__drizzle_migrations" ("hash", "created_at")
      values (${hash}, ${migration.when})
    `;
    console.log(`Baselined ${migration.tag}.`);
  }
} finally {
  await sql.end();
}
