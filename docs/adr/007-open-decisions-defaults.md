# ADR-007: Open Decisions — PRD Defaults

## Status

Accepted (MVP defaults)

## Context

Eight decisions remained open after the initial grill-me session (see plan "Open Decisions" section). The PRD ([UDI-10](https://linear.app/udit19199/issue/UDI-10/kaisa-laga-mvp-voice-cx-capture-platform)) resolved each with pragmatic MVP defaults to unblock implementation. These are not final production choices — revisit before scaling beyond early pilots.

## Decision

Apply the following defaults for all eight open decisions.

---

### 1. Max recording duration

**Default: 30 seconds**

- MediaRecorder enforces a 30s cap client-side
- UI shows progress or countdown near limit
- Longer recordings increase STT cost and dilute focus; 30s balances detail vs. friction

**Revisit when:** Operators report feedback is too short, or STT costs dominate at scale.

---

### 2. Fixable keyword list

**Default: global static list**

Shared across all organizations for MVP. Alert engine matches case-insensitively against:

`dirty`, `cold`, `hot`, `loud`, `broken`, `smell`, `wait`, `slow`, `rude`, `empty`, `closed`, `wet`, `sticky`, `hair`, `bug`, `roach`, `mold`

**Revisit when:** Operators need industry-specific or per-org keyword tuning.

---

### 3. Operator primary language

**Default: org-level setting, default English (`en`)**

- Stored on `organizations.primary_language`
- Translation step runs when detected submission language ≠ org primary language
- Operator configures in dashboard settings

**Revisit when:** Per-location language overrides are needed (e.g., bilingual markets).

---

### 4. Customer UI i18n

**Default: browser locale only (no language picker)**

- Capture page strings resolved from `navigator.language` / `Accept-Language`
- No explicit language selector on MVP capture UI
- Customer may speak any language; only UI chrome is localized

**Revisit when:** Operators in tourist-heavy markets request explicit language selection.

---

### 5. Dashboard real-time updates

**Default: polling every 30 seconds, not Supabase Realtime**

- Inbox and charts refresh on 30s interval while dashboard is open
- Simpler than Realtime subscriptions; acceptable latency for MVP operators

**Revisit when:** Operators need sub-10s inbox updates or live alert indicators in-dashboard.

---

### 6. Audio format

**Default: WebM/Opus from MediaRecorder**

- Browser `MediaRecorder` with `audio/webm;codecs=opus` where supported
- Server accepts WebM uploads from capture flow
- Max file size: enforce server-side limit aligned with 30s Opus (~500 KB–2 MB typical); reject oversize with 413

**Revisit when:** Safari-only deployments require MP4/AAC fallback, or Whisper compatibility issues arise.

---

### 7. Deployment target

**Default: Vercel + documented env/secrets layout**

Single Next.js deploy on Vercel. Secrets in Vercel project settings (Production / Preview / Development). Local dev uses `.env.local` (gitignored).

#### Expected environment variables

| Variable | Scope | Required | Purpose |
|----------|-------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client + Server | Yes | Supabase publishable key (`sb_publishable_...`, RLS-enforced) |
| `SUPABASE_SECRET_KEY` | Server only | Yes | Supabase secret key (`sb_secret_...`) for capture, Inngest, admin tasks |
| `OPENAI_API_KEY` | Server only | Yes | Whisper STT + GPT-4o-mini |
| `INNGEST_EVENT_KEY` | Server only | Yes | Send events to Inngest |
| `INNGEST_SIGNING_KEY` | Server only | Yes | Verify Inngest webhook signatures |
| `RESEND_API_KEY` | Server only | Yes | Send alert emails |
| `RESEND_FROM_EMAIL` | Server only | Yes | Verified sender address (e.g. `alerts@kaisa-laga.app`) |
| `NEXT_PUBLIC_APP_URL` | Client + Server | Yes | Canonical app URL for email links and QR generation |

**Optional / derived**

| Variable | Notes |
|----------|-------|
| `VERCEL_URL` | Auto-set by Vercel; use as fallback for preview deploys |
| `NODE_ENV` | Auto-set by Vercel |

**Layout guidance**

- Never commit `.env.local` or production secrets
- `NEXT_PUBLIC_*` only for values safe to expose to the browser
- Supabase secret, OpenAI, Inngest, and Resend keys are server-only (API routes, Inngest functions)
- Use separate Supabase projects for preview vs. production when possible

**Revisit when:** Multi-region deploy, edge-only capture, or dedicated worker runtime is split from Vercel.

---

### 8. Data retention

**Default: 90 days raw audio**

- Raw audio files in Supabase Storage deleted (or archived) 90 days after submission `created_at`
- Processed metadata (transcript, tags, sentiment) retained for dashboard history unless operator requests deletion
- Document policy in privacy/terms before production pilots

**Revisit when:** GDPR delete requests, legal hold requirements, or operators need longer audio playback.

---

## Consequences

**Positive**

- Unblocks implementation without further grill-me sessions
- Defaults are consistent with speed-to-MVP posture
- Env var table gives a clear Vercel setup checklist

**Negative**

- Global keywords may misfire across industries
- 30s polling feels stale for alert-heavy operators
- 90-day retention may conflict with operator expectations or compliance

## Revisit When

Any default causes pilot friction, compliance risk, or measurable cost/performance issues. See [REVISIT.md](../REVISIT.md) for the full pre-production checklist.

## Future Options

Per-decision upgrades are documented in ADR-001 through ADR-006 and in [REVISIT.md](../REVISIT.md).

## Fault Tolerance Gaps

- No automated retention job or lifecycle policy on Storage yet
- No env validation at boot (missing keys fail at runtime)
- No per-org keyword or retention overrides
