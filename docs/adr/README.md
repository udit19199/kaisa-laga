# Architecture Decision Records (ADR)

Kaisa Laga MVP architecture decisions from the grill-me session. Every choice prioritizes **speed-to-MVP** over production resilience. Revisit before scaling beyond early pilots.

See also: [REVISIT.md](../REVISIT.md) — pre-production checklist.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [001](./001-application-architecture.md) | Application Architecture — Next.js monolith | Accepted (MVP) |
| [002](./002-data-auth-storage.md) | Data, Auth, and Storage — Supabase | Accepted (MVP) |
| [003](./003-async-processing-pipeline.md) | Async Processing Pipeline — Inngest | Accepted (MVP) |
| [004](./004-alert-delivery.md) | Alert Delivery — Email only | Accepted (MVP) |
| [005](./005-tag-taxonomy.md) | Tag Taxonomy — Predefined categories | Accepted (MVP) |
| [006](./006-operator-onboarding.md) | Operator Onboarding — Self-serve signup | Accepted (MVP) |
| [007](./007-open-decisions-defaults.md) | Open Decisions — PRD defaults | Accepted (MVP defaults) |
| [008](./008-semantic-discovery-taste.md) | Semantic Discovery and Taste Matching | Accepted |

## MVP Stack Summary

| Layer | Choice |
|-------|--------|
| Frontend + API | Next.js App Router monolith |
| Database + Auth + Files | Supabase |
| Job queue | Inngest |
| STT | OpenAI Whisper API |
| LLM | GPT-4o-mini (structured outputs) |
| Email alerts | Resend (recommended) or SendGrid |
| Hosting | Vercel |

## Format

Each ADR includes:

- **Status** — decision state
- **Context** — problem and constraints
- **Decision** — what we chose
- **Consequences** — tradeoffs
- **Revisit When** — triggers to reconsider
- **Future Options** — alternatives not chosen
- **Fault Tolerance Gaps** — known MVP weaknesses
