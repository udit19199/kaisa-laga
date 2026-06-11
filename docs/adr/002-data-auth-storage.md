# ADR-002: Data, Auth, and Storage

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-06-11 |

## Decision

Supabase — Postgres + Auth + Storage.

## Rationale (MVP)

One vendor for DB, operator login, and audio file storage. Row Level Security for tenant isolation without custom auth middleware.

## Revisit when

Multi-region latency matters, RLS policies become complex, or Storage egress costs spike with audio volume.

## Future options

Neon Postgres + Clerk + S3/R2; read replicas; dedicated object storage with lifecycle policies (archive raw audio after N days).

## Fault tolerance gaps

Supabase is a single dependency for auth, DB, and files. No backup/restore runbook yet. No cross-region failover.
