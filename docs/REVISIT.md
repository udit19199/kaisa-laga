# PulseDrop — Pre-Production Revisit Checklist

Review each item before moving beyond early pilots.

## Open Decisions (Resolved for MVP)

| Decision | MVP Default |
|---|---|
| Max recording duration | 30 seconds |
| Fixable keywords | Global static list |
| Operator primary language | Org-level setting, default English |
| Customer UI i18n | Browser locale only |
| Dashboard updates | Polling (30s interval) |
| Audio format | WebM/Opus from MediaRecorder |
| Deployment target | Vercel |
| Data retention | 90 days raw audio (document only) |

## Production Readiness

- [ ] **Queue durability**: Is Inngest sufficient, or migrate to BullMQ + Redis with dead-letter queues?
- [ ] **Idempotency**: Prevent duplicate STT/LLM/alert on job retry
- [ ] **API resilience**: Circuit breakers + fallback when OpenAI is down; queue backpressure alerts
- [ ] **Alert deduplication**: Rate-limit alerts per location/category within a time window
- [ ] **Multi-channel alerts**: Add Slack/WhatsApp based on operator feedback
- [ ] **RBAC**: Per-location manager scoping for franchise model
- [ ] **Observability**: Structured logging, submission processing SLA metrics, failed job dashboard
- [ ] **Data lifecycle**: Audio retention policy (90-day default), GDPR/delete requests
- [ ] **Capture page performance**: Edge caching, bundle size audit for <1s load target
- [ ] **Supabase limits**: Connection pooling (PgBouncer), Storage egress, RLS audit
