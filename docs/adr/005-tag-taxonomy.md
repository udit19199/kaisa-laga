# ADR-005: Tag Taxonomy

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-06-11 |

## Decision

Predefined category list; LLM selects 1–3 via structured JSON output.

## Rationale (MVP)

Consistent labels for bar charts. Avoids tag fragmentation ("wait time" vs "slow service").

## Categories

Wait Time, Staff, Cleanliness, Food Quality, Noise, Pricing, Bathroom, Atmosphere, Parking, Other

## Revisit when

Operators need industry-specific categories, per-org custom tags, or emergent theme discovery.

## Future options

Hybrid model (predefined primary + freeform secondary); operator-editable taxonomy; LLM-suggested new categories with admin approval queue.

## Fault tolerance gaps

Invalid LLM tags fall back to "Other" via Zod schema validation.
