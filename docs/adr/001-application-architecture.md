# ADR-001: Application Architecture

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-06-11 |

## Decision

Next.js full-stack monolith (App Router).

## Rationale (MVP)

Single repo, single deploy, shared types. Customer capture at `/f/[locationId]` and operator dashboard at `/dashboard/*` in one app.

## Revisit when

Capture traffic or dashboard complexity grows enough to need independent scaling, CDN tuning, or separate release cycles.

## Future options

Split capture SPA (ultra-minimal, edge-only) from dashboard API; dedicated worker service for AI pipeline.

## Fault tolerance gaps

Single deploy = single blast radius. No circuit breakers between capture upload and processing yet.
