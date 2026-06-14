# Kaisa Laga — Codebase Map

Quick orientation for humans and agents. Read [`PRODUCT.md`](../PRODUCT.md) and [`DESIGN.md`](../DESIGN.md) before UI work.

## Layers

| Layer | Path | Responsibility |
|-------|------|----------------|
| Routes | `src/app/` | Pages and thin API route handlers |
| Server | `src/server/` | Business logic, Drizzle queries, auth context |
| Database | `src/db/` | Drizzle schema, client, Postgres RPC wrappers |
| Storage | `src/lib/storage.ts` | Supabase Storage for audio files only |
| Shared lib | `src/lib/` | Pure utilities, AI providers, schemas, email |
| Async | `src/inngest/` | Durable background jobs |
| UI | `src/components/` | React components by surface |

## Data access rules

- **Postgres:** Drizzle only (`src/db/`, `src/server/`). Never use Supabase JS for queries.
- **Audio files:** `src/lib/storage.ts` (Supabase Storage bucket `submissions-audio`).
- **Auth:** Clerk (`src/server/auth/`). Invitation and dashboard routes use Clerk, not Supabase Auth.
- **Migrations:** `src/db/schema.ts` → `bun run db:generate` → `drizzle/migrations/` → `bun run db:migrate`.
- **RPC functions** (`accept_public_submission`, `provision_organization`, etc.): called via `src/db/rpc.ts`.

## Where to put new code

| Change | Put it in |
|--------|-----------|
| New API endpoint | `src/app/api/.../route.ts` (thin) + `src/server/<domain>.ts` |
| New DB table/column | `src/db/schema.ts`, then generate migration |
| New dashboard screen | `src/app/dashboard/...` + `src/components/dashboard/` |
| New marketing experiment | `src/components/marketing/` — delete when retired |
| Guest capture UI | `src/components/capture/` |
| Background job step | `src/inngest/functions/` calling `src/server/` |

## Surface boundaries (customer vs internal)

Keep experiments inside their route — do not import across boundaries.

| Surface | Route | Component root | Theme |
|---------|-------|----------------|-------|
| **Consumer home** | `/` | `src/components/marketing/home-page.tsx` | White marketing layout (`font-marketing-*`) — **no sky** |
| **Guest capture** | `/f/[locationId]` | `src/components/capture/` | `capture-surface` |
| **Operator auth** | `/sign-in`, `/sign-up` | Clerk + `(auth)/layout` | Neutral slate |
| **Onboarding** | `/dashboard/onboarding` | `onboarding-form.tsx` | Neutral slate + shadcn `Card` — **no sky** |
| **Operator dashboard** | `/dashboard/*` | `src/components/dashboard/` | shadcn dashboard shell |

**Live homepage wiring:** `src/app/page.tsx` → `HomePage` from `home-page.tsx` only.

## API route pattern

Route handlers should only: parse request → call `requireOrgContext()` if needed → delegate to `src/server/` → return JSON.

```typescript
// src/app/api/locations/route.ts
export async function GET() {
  const auth = await requireOrgContext();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const locations = await listLocationsForOrganization(auth.ctx.organization.id);
  return NextResponse.json({ locations });
}
```

## Naming conventions

| Pattern | Example | Notes |
|---------|---------|-------|
| Pages | `src/app/page.tsx` | Route file names follow Next.js conventions |
| Page components | `home-page.tsx` → `HomePage` | One main export per file; no redundant folder prefix |
| Server modules | `src/server/locations.ts` | Domain noun, no `-service` suffix |
| DB | `src/db/schema.ts`, `rpc.ts` | Short, stable names |
| Middleware | `src/proxy.ts` | Next.js 16 name for what was `middleware.ts` |
| shadcn UI | `src/components/ui/button.tsx` | Keep upstream names when adding primitives |

Avoid: `marketing-landing-page` inside `marketing/`, retired product names (`julienne`), and accidental files like `.github/Untitled`.

## Local-only directories (not product code)

| Path | Keep? | Purpose |
|------|-------|---------|
| `.cursor/` | Yes | Your Cursor IDE settings |
| `.vercel/` | Yes (local) | Vercel CLI project link — gitignored |
| `.github/workflows/` | Yes | CI — only tracked part of `.github/` |
| `.agents/`, `.github/skills/` | No | Agent skill caches (~4MB); gitignored; reinstall via Cursor plugins |
| `.impeccable/` | No | Design tool session artifacts; gitignored |
| `skills-lock.json` | No | Skill installer lockfile; gitignored |

These dot-folders are **not part of the app**. They can appear after using design or agent plugins. Safe to delete; `.gitignore` prevents them from being committed.

