# Exploration: Semantic discovery & taste matching

| | |
|---|---|
| **Status** | Exploration — not in MVP scope |
| **Captured** | 2026-06-14 |
| **Revisit when** | Published reviews exist on `/`; enough venues that keyword search is insufficient |

## Why this might matter

Homepage discovery (`/`) is the public entry point. Diners in India often search by **intent**, not venue name — e.g. *"something spicy but not Indian, under budget, nearby"*. Substring search does not handle that well. Semantic (vector) search may fit this product better than category filters or star ratings (both explicitly out of scope for diners per `PRODUCT.md`).

## What this is **not**

- **Not RAG** — we are not building a chatbot that synthesizes answers from chunks. Guests get **venue/review cards**, not generated paragraphs.
- **Not chunking on queries** — user queries are short (1–2 sentences); embed the whole query.
- **Not Algolia by default** — Algolia is strong for typo-tolerant keyword + facet browse; our direction is intent/vibe search and minimal filter UI. Revisit Algolia only if we need sub-50ms instant search at large scale with dedicated search ops.
- **Not blocking MVP** — capture, operator inbox, and publish pipeline come first.

## Recommended direction (when we revisit)

**Build on existing stack:** embedding API + Supabase `pgvector` + hybrid SQL filters.

| Layer | Mechanism |
|-------|-----------|
| Vibe / cuisine / mood | Vector similarity on venue `search_document` |
| Budget | Structured `price_band` (SQL) |
| Nearby | Geo / area (SQL) — not semantic |

### What to index

1. **Primary (day one):** one embedding per **venue** (`locations`), not per review. Maintain a `search_document` text blob rolled up from published reviews (themes, cuisine signals, guest language, price hints).
2. **Secondary:** optional per-published-review rows for quote-level drill-down.
3. **Later (phase C):** **user taste embeddings** for signed-up diners — match user taste ↔ venue taste. Requires consumer accounts (today: capture is anonymous; Clerk is operator-only). Collaborative "people like you" needs data density.

Roll up reviews into venue documents; avoid chunking unless transcripts become very long.

### Ingest hook

Extend the existing Inngest categorization step to emit or refresh `search_document`, then embed **on publish** (not on every homepage visit). Same pipeline pass where possible to avoid extra LLM calls.

### Query cost discipline

- Embed queries on submit / debounced — not every keystroke.
- Cache normalized query embeddings.
- Cheap models: `text-embedding-3-small` or `gemini-embedding-001` @ 768 dimensions.
- Query embedding cost is negligible vs STT + categorization per capture.

## Prerequisites before building

- [ ] Public **publish** model (submissions visible to anonymous diners after preview window)
- [ ] RLS / API for anonymous read of published content only
- [ ] Homepage reads from real data (not static `featuredReviews`)
- [ ] `pgvector` migration on Supabase
- [ ] `/api/search` (or server action) — hybrid vector + geo + budget

## Open product questions

- Consumer accounts for taste profiles vs anonymous discovery only?
- How much "personality / your taste" to surface in UI without becoming a social profile product?
- Privacy: public reviews + taste matching — what is opt-in?

## References

- Homepage discovery: `src/components/marketing/marketing-landing-page.tsx`
- Processing pipeline: `src/inngest/functions/process-submission.ts`
- Product rules (diners): `PRODUCT.md` → Show only what earns its place
- Pre-production checklist: `docs/REVISIT.md`

## Next step when picked up

Draft accepted ADR (replace this exploration doc or supersede with `008-semantic-discovery.md`) with schema: `search_document`, `search_embedding`, publish hook, and `/api/search` contract. Park user-taste matching in the same ADR as phase C.
