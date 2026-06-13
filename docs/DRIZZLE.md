# Drizzle Workflow

Drizzle is the primary forward migration workflow for PulseDrop.

## Source of truth

- Application schema: `src/db/schema.ts`
- Forward migration artifacts: `drizzle/migrations/`
- Database introspection output: `drizzle/introspect/`

`supabase/migrations/` is archived legacy history. New schema changes should start in `src/db/schema.ts` and land in `drizzle/migrations/`.

## Day-to-day workflow

1. Update `src/db/schema.ts`
2. Run `bun run db:generate`
3. Review the generated SQL in `drizzle/migrations/`
4. If a change needs Postgres functions, triggers, RLS, or Storage policies, append the required SQL directly inside the generated Drizzle migration file
5. Apply with `bun run db:migrate`

## Connection URLs

- `DATABASE_URL` is the runtime connection string used by the app. A Supabase transaction-mode pooler URL is fine here.
- `DATABASE_DIRECT_URL` is the direct Postgres connection string used by Drizzle migrations, `db:pull`, and backend smoke tests.
- If `DATABASE_DIRECT_URL` is absent, the repo derives a direct connection from `NEXT_PUBLIC_SUPABASE_URL` plus `SUPABASE_DB_PASSWORD`.

## Fresh databases

For a brand-new Supabase project:

1. `bun run db:migrate`
2. `bun run db:verify-clerk`

## Existing databases

If you already have a development database that matches the current PulseDrop schema, run:

1. `bun run db:baseline`

That records the initial Drizzle baseline migration as already applied so future `db:migrate` runs still execute newer forward migrations.

If you still have an older pre-Drizzle dev database, prefer resetting it and reapplying `bun run db:migrate`. The legacy SQL scripts are kept only as reference and emergency recovery material.

## Introspection

Use `bun run db:pull` only as an audit tool. It writes generated files into `drizzle/introspect/` so it does not overwrite the real app schema or migration history.

## Smoke test

Run `bun run db:smoke:backend` to execute a transactional provisioning and submission smoke test. It rolls back all inserted rows before exiting.
