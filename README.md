# Pulse Drop

Frictionless voice feedback capture for physical businesses. Customers scan a QR code, hold to record (30s max), and get an instant thank-you. Operators get transcripts, sentiment, tags, charts, and email alerts for fixable negative feedback.

**Agents & issue tracking:** See [`AGENTS.md`](AGENTS.md) for Linear workflow (milestones, sub-issues, sync rules). Work is tracked in the [Pulse Drop Linear project](https://linear.app/udit19199/project/pulsedrop-7bc2b6a39345).

## Stack

- **Next.js 16** (App Router monolith)
- **Supabase** (Postgres + Storage + RLS)
- **Clerk** (operator auth)
- **Inngest** (async AI pipeline)
- **OpenAI / Gemini** (STT + categorization with automatic provider fallback)
- **Resend** (email alerts)
- **shadcn/ui** (operator dashboard)

## Quick Start

### 1. Clone and install

Requires [Bun](https://bun.sh) 1.1+.

```bash
bun install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in Supabase, Clerk, at least one AI provider (OpenAI and/or Gemini), Inngest, and Resend credentials.

### 3. Set up Supabase

Run migrations in `supabase/migrations/` against your Supabase project (SQL Editor or CLI).

After enabling Clerk, apply the Clerk column migration and verify:

```bash
# Option A — SQL Editor: paste supabase/migrations/003_clerk_auth.sql

# Option B — CLI (requires database password from Supabase dashboard)
SUPABASE_DB_PASSWORD='…' bun run db:apply-clerk
bun run db:verify-clerk   # should print OK
```

### 4. Run locally

```bash
# Terminal 1 — Next.js dev server
bun dev

# Terminal 2 — Inngest dev server
bun run inngest:dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Operator onboarding

1. Sign up at `/sign-up` (Clerk) → name your business at `/dashboard/onboarding`
2. Add locations at `/dashboard/locations`
3. Download QR codes and deploy at tables/counters
4. Configure alert email and primary language in Settings

## Routes

| Route | Description |
|---|---|
| `/f/[locationId]` | Customer capture (no auth) |
| `/sign-in`, `/sign-up` | Clerk operator auth |
| `/dashboard/onboarding` | Create organization after signup |
| `/dashboard` | Operator inbox |
| `/dashboard/analytics` | Sentiment + category charts |
| `/dashboard/locations` | Location CRUD + QR download |
| `/dashboard/settings` | Org settings |
| `POST /api/submissions` | Audio upload (public) |
| `GET /api/submissions` | Inbox (authenticated) |

## Testing

```bash
bun test        # Vitest unit tests
bun run build   # Production build
```

## Architecture

See `docs/adr/` for architecture decision records and `docs/REVISIT.md` for pre-production checklist.

## Ship to production

```bash
git add -A && git commit -m "your change" && git push origin main
```

Push to `main` → Vercel builds and deploys automatically to [pulsedrop-six.vercel.app](https://pulsedrop-six.vercel.app).

See [`docs/DEPLOY.md`](docs/DEPLOY.md) for the full workflow, preview deploys, and CI.

**One-time setup** (already done): GitHub repo connected to Vercel, env vars in project settings, migration 003 applied.

**Manual deploy only if needed:** `vercel deploy --prod`
