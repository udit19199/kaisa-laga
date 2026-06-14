# Kaisa Laga

Verified customer feedback and trust for restaurants, cafes, and hotels in India. Guests scan a QR after a real visit and answer *"Kaisa laga?"* with quick voice or text feedback. Businesses get AI insights, a private recovery window, and a public profile of visit-based reviews.

**Product & design:** [`PRODUCT.md`](PRODUCT.md) · [`DESIGN.md`](DESIGN.md)  
**Codebase map:** [`src/ARCHITECTURE.md`](src/ARCHITECTURE.md)  
**Agents & issues:** [`AGENTS.md`](AGENTS.md) · [Linear](https://linear.app/udit19199/project/kaisa-laga-7bc2b6a39345)

## Stack

- **Next.js 16** (App Router monolith)
- **Drizzle ORM** + Postgres (Supabase-hosted)
- **Supabase Storage** (audio files only)
- **Clerk** (operator auth)
- **Inngest** (async AI pipeline)
- **Sarvam + Gemini** (STT + categorization)
- **Resend** (email alerts)
- **shadcn/ui** (operator dashboard)

## Quick start

Requires [Bun](https://bun.sh) 1.1+.

```bash
bun install
cp .env.example .env.local   # fill in credentials
DATABASE_DIRECT_URL='…' bun run db:migrate
```

```bash
# Terminal 1
bun dev

# Terminal 2
bun run inngest:dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

Drizzle is the single source of truth for schema and migrations.

| Path | Purpose |
|------|---------|
| `src/db/schema.ts` | Application schema |
| `drizzle/migrations/` | Forward SQL migrations |
| `src/db/rpc.ts` | Postgres function wrappers |
| `src/server/` | Typed query and mutation layer |

```bash
bun run db:generate   # after schema changes
bun run db:migrate    # apply migrations
bun run db:studio     # browse data
bun run db:smoke:backend
```

**Connection URLs:**

- `DATABASE_URL` — runtime (transaction pooler is fine)
- `DATABASE_DIRECT_URL` — migrations and smoke tests (direct Postgres)

See [`docs/DRIZZLE.md`](docs/DRIZZLE.md) for the full workflow.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Consumer homepage — verified reviews discovery |
| `/f/[locationId]` | Guest capture — voice/text feedback (no auth) |
| `/sign-in`, `/sign-up` | Clerk operator auth |
| `/dashboard/onboarding` | Create organization after signup |
| `/dashboard` | Operator overview |
| `/dashboard/inbox` | Submission inbox |
| `/dashboard/locations` | Location CRUD + QR download |
| `/dashboard/settings` | Org settings |
| `POST /api/submissions` | Public audio upload |
| `GET /api/submissions` | Authenticated inbox |
| `GET /api/analytics/sentiment` | Sentiment time series (API) |
| `GET /api/analytics/categories` | Category breakdown (API) |

## Operator onboarding

1. Sign up at `/sign-up` → name your business at `/dashboard/onboarding`
2. Add locations at `/dashboard/locations`
3. Download QR codes and deploy at tables/counters
4. Configure alert email in Settings

## Development

```bash
bun test          # unit tests (lib seams only for now)
bun run lint
bun run build
```

Broader E2E coverage is deferred while features are still iterating rapidly.

## Architecture

- Code map: [`src/ARCHITECTURE.md`](src/ARCHITECTURE.md)
- ADRs: [`docs/adr/`](docs/adr/)
- Pre-production checklist: [`docs/REVISIT.md`](docs/REVISIT.md)

## Deploy

Push to `main` → Vercel builds and deploys to [kaisa-laga.vercel.app](https://kaisa-laga.vercel.app).

See [`docs/DEPLOY.md`](docs/DEPLOY.md) for preview deploys and CI.
