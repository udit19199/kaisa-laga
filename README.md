# Pulse Drop

Frictionless voice feedback capture for physical businesses. Customers scan a QR code, hold to record (30s max), and get an instant thank-you. Operators get transcripts, sentiment, tags, charts, and email alerts for fixable negative feedback.

**Agents & issue tracking:** See [`AGENTS.md`](AGENTS.md) for Linear workflow (milestones, sub-issues, sync rules). Work is tracked in the [Pulse Drop Linear project](https://linear.app/udit19199/project/pulsedrop-7bc2b6a39345).

## Stack

- **Next.js 16** (App Router monolith)
- **Supabase** (Postgres + Auth + Storage + RLS)
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

Fill in Supabase, at least one AI provider (OpenAI and/or Gemini), Inngest, and Resend credentials.

### 3. Set up Supabase

Run the migration in `supabase/migrations/001_initial_schema.sql` against your Supabase project (SQL Editor or CLI).

### 4. Run locally

```bash
# Terminal 1 — Next.js dev server
bun dev

# Terminal 2 — Inngest dev server
bun run inngest:dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Operator onboarding

1. Sign up at `/dashboard/signup`
2. Add locations at `/dashboard/locations`
3. Download QR codes and deploy at tables/counters
4. Configure alert email and primary language in Settings

## Routes

| Route | Description |
|---|---|
| `/f/[locationId]` | Customer capture (no auth) |
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

## Deployment (Vercel)

1. Push to GitHub and import in Vercel
2. Add all env vars from `.env.example`
3. Run Supabase migration on production project
4. Register Inngest app with your Vercel deployment URL
