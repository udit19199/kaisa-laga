# Product

## Register

brand

## Users

- **Customers** anywhere they have a link or QR: in-store, after a visit, or later when something comes to mind. Often on mobile, one-handed, little patience for forms. Job: leave quick spoken feedback without friction or account creation.
- **Operators** (owners and managers at any business or startup that needs richer customer input than forms): checking feedback between shifts, often on desktop or tablet. Job: see how each outlet is performing, spot themes and sentiment fast, drill into transcripts only when needed.

## Product Purpose

Pulse Drop gives customers a voice-first channel for feedback and turns it into structured operator insight (sentiment overview, themes, tags, alerts; transcripts on drill-down). Success: customers complete a recording in seconds; operators see the big picture per location and act before issues become patterns.

## Homepage (marketing `/`)

**Audience:** Any business or startup where generic forms and comment cards are not enough.

**Page structure (illustration-led, minimal copy):**

1. **Hero** — "Your channel for feedback, insights, and action" only. No duplicate signup CTAs on the page.
2. **Nav** — Log in + 7-day free trial (single conversion path for users who want to skip ahead).
3. **Narrative (3 floating illustrated steps)** — Scan → hold and speak → overview first. CSS scroll reveals; no phone chrome, no Remotion for now.

**Operator onboarding (implied in product, not a long landing section):** Sign up → add location(s) → QR generated per outlet for performance monitoring.

**Trial:** 7 days free so owners can see how it feels before committing.

## Operator experience (direction)

MVP inbox may list individual transcripts; **target experience** is overview-first: overall sentiment and recurring themes per outlet, with drill-down to specific voices when the operator chooses.

## Brand Personality

Friendly, playful, light. Encouraging and human, like a helpful nudge rather than a corporate survey. Warmth in copy and micro-interactions; clarity in data views. Duolingo/Headspace energy: rounded, approachable, confidence-building.

## Anti-references

- Generic SaaS landing templates: cream/sand body backgrounds, gradient text, eyebrow kickers on every section, hero-metric blocks (big number + small label), identical icon-card grids.
- Enterprise-heavy density: navy/gold fintech clichés, stock-photo corporate tone.
- Cold brutalist or terminal-native aesthetics that fight the friendly voice.

Note: default register is brand, but the app (dashboard + capture) must inherit the same warmth. Marketing and product are one identity, not two skins.

## Design Principles

1. **Encourage, don't interrogate** — Capture and onboarding copy should feel like an invitation, not a form. Reduce anxiety around recording and signing up.
2. **Frictionless at the edge** — The customer capture flow is the product promise; every extra tap or visual noise is a failure.
3. **Warmth in the details** — Personality lives in micro-interactions, empty states, and tone; not in decorative SaaS scaffolding.
4. **Clarity when it counts** — Dashboard views stay scannable: sentiment, tags, and alerts must be legible at a glance between shifts.
5. **One brand, two surfaces** — `/` and `/f/*` lead with friendly brand; `/dashboard/*` serves workflow without becoming a different product aesthetic.

## Accessibility & Inclusion

- Target **WCAG 2.1 AA** for text contrast, focus indicators, and form labels.
- Respect `prefers-reduced-motion` on all animations and transitions.
- Capture flow: large touch targets, clear recording state (not color-only), screen-reader labels on hold-to-record control.
