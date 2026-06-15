---
name: Kaisa Laga
description: Verified visit-based reviews — editorial marketing, conversational capture, warm operator workflow
status: consumer-shell (Julienne-pattern mobile app + taste matching)
reference: Mobbin Julienne (onboarding/settings patterns, internal reference only); Clubhouse iOS capture accents for record flow
brandTokens:
  ink: "#080808"
  muted: "#898989"
  line: "#e5e5e5"
  card: "#f7f7f7"
  accent: "#e56b3c"
  capture-live: "oklch(0.72 0.19 155)"
  capture-mic: "oklch(0.22 0 0)"
typography:
  marketing-display:
    fontFamily: "Iowan Old Style, Baskerville, Times New Roman, serif"
    note: "Editorial hero; evolving toward India-aware display pairing"
  marketing-ui:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
  ui:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
surfaces:
  marketing: "Tailwind marketing-* tokens on consumer shell"
  consumer: "Bottom nav shell — Search / Capture / Profile"
  capture: ".capture-surface"
  dashboard: "shadcn dashboard shell"
---

# Design System: Kaisa Laga

## Overview

**Creative North Star: "The Conversation After the Meal"**

Kaisa Laga should feel like one food lover asking another *"Kaisa laga?"* — not a corporate review form, not a government record, not a dark ops console. The name is the product gesture: curious, direct, human.

**Current design focus:** consumer mobile shell (`/`, `/for-you`, `/capture`, `/profile`), taste onboarding (`/taste/onboarding`), and customer capture (`/f/*`). Dashboard branding editor is desktop-first.

### Surface map

| Surface | Route | Direction | Layout | Character |
|---------|-------|-----------|--------|-----------|
| **Consumer shell** | `/`, `/for-you`, `/capture`, `/profile` | Julienne-pattern mobile app | **Mobile-first** | Bottom nav; Search = reviews + intent search; For you = taste matches (signed-in) |
| **Taste onboarding** | `/taste/onboarding` | Preference wizard | **Mobile-first** | Allergies grid, dietary cards, spice/budget — Mobbin Julienne reference patterns |
| **Business entry** | `/for-business` (planned) | Operator conversion | **Mobile-first** | Side door: pilot signup / contact |
| **Customer capture** | `/f/[locationId]` | Conversational mobile | **Mobile-first** | *Kaisa laga?* prompt, voice + text; optional taste profile link on thank-you |
| **Operator dashboard** | `/dashboard/*` | Workflow | **Desktop / web-first** | Branding editor + read-only taste summary per location |
| **Auth** | `/sign-in`, `/sign-up`, `/sign-in/diner` | Clerk | **Mobile-first** (diner) / web (operator) | Separate diner sign-in path |

### Migration note

The consumer Search tab (`discover-page.tsx`) keeps the editorial review rail and intent search bar, now inside a **Julienne-pattern bottom-nav shell** with `marketing-*` tokens. Taste onboarding borrows Julienne card/grid/progress patterns (Mobbin reference only — not the retired product name).

Capture uses `.capture-surface` tokens in `globals.css`. Dashboard uses the shadcn shell.

### Responsive strategy

**Mobile-first for guest and public surfaces.** Diners, in-venue guests, and operators checking a link on their phone are the default audience for `/`, `/f/*`, and planned `/for-business`. Style the narrow viewport first; add `md:` / `lg:` enhancements for wider screens (e.g. five-column review grid on desktop, horizontal scroll rail on phone).

**Desktop-first for operator workflow.** `/dashboard/*` targets owners and managers at a desk — inbox, charts, and settings assume a wide viewport and pointer/keyboard input. Dashboard may degrade gracefully on mobile but is not designed mobile-first.

Tailwind breakpoints: base = phone, `md` ≈ tablet, `lg` ≈ desktop layout shifts.

## Marketing visual direction

### Scene sentence

A guest finishes chai and a sandwich at a Bandra cafe. A friend texts *"Kaisa laga?"* That same energy — casual, specific, trusted — is what the landing and review cards should feel like.

### Layout signatures (keep)

- **Editorial serif hero** with a muted second line for context.
- **Ultra-minimal top nav** with a clear business side entry, not a crowded SaaS header.
- **Horizontal scrolling review rail** — cards as visit moments, not feature grids.
- **Quiet white canvas** with hairline borders; restraint over decoration.
- **QR or app entry** only where it serves discovery or capture, not as a generic growth hack block.

### Color strategy (marketing)

**Restrained → committed:** true white (`#fff`) body, near-black ink (`#080808`), warm accent for primary CTA (terracotta/orange family, e.g. `#e56b3c`). Warmth lives in accent, photography, and copy — not cream/sand AI-default body backgrounds.

### Typography (marketing)

| Role | Font | Use |
|------|------|-----|
| Display | Iowan Old Style / Baskerville class serif | Hero headline, brand wordmark rhythm |
| UI | Helvetica Neue / system sans | Nav, buttons, card metadata |
| Future | India-aware display pairing TBD | Optional Devanagari-friendly accent for *Kaisa laga* lockup |

Dashboard and capture continue on **Geist Sans** for workflow density until a deliberate unification pass.

### Visual anchor

**Premium cafes and neighbourhood restaurants** for imagery and copy pacing — repeat visits, counter energy, mixed age groups, natural QR behaviour. Avoid luxury-hotel visual stiffness on the consumer landing even when hotels are a B2B pilot segment.

## Capture visual direction

Capture keeps the **hold-to-record** interaction model and Clubhouse-inspired accents where already implemented:

| Token | Role |
|-------|------|
| `--capture-mic` / `--brand-mic` | Idle record control |
| `--capture-live` / `--brand-live` | Recording ring, waveform, success (go-green, not destructive red) |
| `.capture-surface` | Mobile-first gradient background |
| `.capture-dock` | Bottom record dock |

**Copy tone on capture:** *"Kaisa laga?"* as the primary prompt — invitation, not interrogation. Hinglish-friendly subtitles where helpful.

**Do not** use destructive red for recording state.

## Dashboard (deferred shell pass)

Operators need clarity between shifts, not marketing theatre. When the dashboard shell is redesigned:

- Warm, light workflow density on Geist.
- Scannable sentiment, themes, alerts; drill-down to transcripts.
- **Avoid** dark ops-room aesthetics, navy fintech clichés, and enterprise stock-photo tone on operator surfaces.

## Anti-patterns (Kaisa Laga specific)

In addition to generic SaaS slop (gradient text, eyebrow on every section, hero metrics, identical icon grids):

- **Don't** frame reviews as customer-to-customer corporate ratings — frame as person-to-person recommendations.
- **Don't** use civic/government trust visuals (stamps, institutional green forms, classified-ad layouts) on consumer marketing.
- **Don't** use dark ops dashboards or terminal-native aesthetics on `/` or `/for-business`.
- **Don't** use luxury-hotel stiffness (excessive serif formality, gold/navy prestige palettes) on the public discovery landing.
- **Don't** keep placeholder reference brand names (Julienne) in user-visible UI.
- **Don't** pair 1px borders with wide soft drop shadows on the same card (ghost-card tell).

## Motion

- **Capture:** `capture-done-enter`, ring progress transitions; respect `prefers-reduced-motion`.
- **Marketing rail:** subtle horizontal scroll; optional staggered card entrance — content visible by default, never gated on animation.
- **Reduced motion:** crossfade or instant state; no animation-only content reveals.

## Components in flight

| Component | Location | Status |
|-----------|----------|--------|
| Marketing landing | `marketing-landing-page.tsx` | Tailwind + `marketing-*` tokens; canonical `/` (search + discovery) |
| Capture flow | `capture-page.tsx` | Active pass for conversational *Kaisa laga?* branding |
| Variant gallery | `landing-variants.ts`, `variant-landing-page.tsx` | Exploration catalog; not canonical brand |
| Record primitives | `record-primitives.tsx` | Shared mic ring / waveform for capture |

## Token source rule

Colors and type for new work come from CSS variables in `globals.css` or documented marketing tokens above. Do not hardcode one-off hex in JSX unless migrating a documented reference block.

## Do's and Don'ts

### Do

- **Do** show only what helps the person on this screen (see `PRODUCT.md` → Show only what earns its place).
- **Do** lean into *Kaisa laga* as voice and layout anchor.
- **Do** use photography and spacing for craft — consumer pages are image-led, not metadata-led.
- **Do** keep operator data (sentiment, tags, counts) on dashboard surfaces only.
- **Do** separate consumer discovery (`/`) from business onboarding (`/for-business`).
- **Do** respect `prefers-reduced-motion`.
- **Do** target WCAG 2.1 AA contrast.

### Don't

- **Don't** use Pulse Drop, Julienne, or Oris as product names.
- **Don't** put category filters, sentiment chips, visit counts, or trust-badge walls on consumer discovery.
- **Don't** copy Swiggy/Zomato density patterns on the public homepage.
- **Don't** collapse business and consumer stories into one confused homepage hero.
- **Don't** show reviews for venues that have not onboarded.
- **Don't** ship placeholder asset filenames or internal labels in user-facing UI.

---

- **Product context & audiences:** [`PRODUCT.md`](PRODUCT.md)
- **Mobbin capture references:** [`docs/design/mobbin-capture-references.md`](docs/design/mobbin-capture-references.md)
- **Architecture:** [`docs/adr/`](docs/adr/)
