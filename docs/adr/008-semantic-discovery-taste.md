# ADR-008: Semantic Discovery and Taste Matching

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-06-15 |

## Context

Diners discover venues on mobile (`/`) through visit-based reviews. Intent-based search (*"spicy, not Indian, budget"*) and personalized matching require vector similarity, not keyword filters alone. Operators contribute supply via onboarded locations; taste profiles deepen when guests link verified captures to personal accounts.

Prior exploration: [docs/explore/semantic-discovery.md](../explore/semantic-discovery.md).

## Decision

1. **Venue taste** — one `search_document` + `search_embedding` (768-dim) per `locations` row, rolled up from **published** submissions on publish; operators edit **branding only** (name, tagline, cover image).
2. **Diner taste** — `diners` table keyed by Clerk user id; bootstrap via short onboarding JSON + embedding until **≥3 linked reviews**, then blend `0.7 × review_embedding + 0.3 × onboarding_embedding`.
3. **Review attribution** — optional post-capture link (`diner_submissions`); capture stays anonymous by default.
4. **Publish model** — submissions get `preview_ends_at` (default 7 days after processing); `is_public` flips true via Inngest sleep, then venue taste refreshes.
5. **Matching** — `GET /api/matches/for-you` returns cosine-ranked active venues; hard dietary/allergy constraints from onboarding JSON (SQL), not vectors.
6. **Consumer UI** — Julienne Mobbin patterns (reference only); bottom nav: Discover · For you · Capture · Profile. Operator dashboard stays desktop shadcn.

## Stack

| Layer | Choice |
|-------|--------|
| Embeddings | OpenAI `text-embedding-3-small` @ 768 dimensions |
| Storage | Postgres `pgvector` via Drizzle custom type |
| Auth | Same Clerk app; diners without org membership |

## Consequences

- Requires `pgvector` extension in Postgres migrations.
- Matching quality depends on published review volume; empty states need onboarding CTA.
- OpenAI embedding calls on publish and diner link (cached documents, not per page view).

## Revisit when

- Enough venues for collaborative filtering without personal review history.
- Geo/distance becomes primary filter (hybrid SQL + vector).
- Embedding cost or latency requires dedicated search service.

## References

- `src/db/schema.ts` — `diners`, `diner_submissions`, location/submission taste columns
- `src/server/taste.ts` — rollup, match, publish helpers
- `src/inngest/functions/taste-pipeline.ts` — publish delay + embedding refresh
