# Drizzle Workflow

Drizzle is the only schema and migration system for Kaisa Laga.

## Source of truth

| Path | Purpose |
|------|---------|
| `src/db/schema.ts` | Application schema |
| `drizzle/migrations/` | Forward migration SQL |
| `src/db/rpc.ts` | Postgres function wrappers |
| `src/server/` | Application data access layer |

## Day-to-day workflow

1. Update `src/db/schema.ts`
2. Run `bun run db:generate`
3. Review the generated SQL in `drizzle/migrations/`
4. If a change needs Postgres functions, triggers, RLS, or Storage policies, append the required SQL inside the generated migration file
5. Apply with `bun run db:migrate`

## Connection URLs

- `DATABASE_URL` — runtime connection (transaction pooler is fine; client uses `prepare: false`)
- `DATABASE_DIRECT_URL` — migrations, `db:pull`, smoke tests (direct Postgres)
- If `DATABASE_DIRECT_URL` is absent, the repo derives a direct URL from `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_DB_PASSWORD`

## Fresh database

```bash
DATABASE_DIRECT_URL='…' bun run db:migrate
bun run db:smoke:backend
```

## Introspection

`bun run db:pull` writes audit output to `drizzle/introspect/` — it does not overwrite the app schema.

## Smoke test

`bun run db:smoke:backend` runs a transactional provisioning and submission test. All inserted rows are rolled back.
