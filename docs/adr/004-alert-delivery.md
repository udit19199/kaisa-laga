# ADR-004: Alert Delivery

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-06-11 |

## Decision

Email only (Resend).

## Rationale (MVP)

Fastest integration; satisfies "instant alert to manager" without WhatsApp Business verification delay.

## Trigger logic (MVP)

`sentiment === "Negative"` AND transcript matches global fixable keyword list.

## Revisit when

Operators report email is too slow or ignored; on-floor staff need mobile push (WhatsApp/Slack/SMS).

## Future options

Slack incoming webhook (half-day add); WhatsApp via Twilio/Meta Cloud API (3–5+ days + business verification); per-location alert routing; on-call schedules.

## Fault tolerance gaps

No retry on email failure beyond Inngest defaults. No alert deduplication (same issue, 5 submissions = 5 emails). No delivery status tracking.
