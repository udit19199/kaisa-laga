---
name: Pulse Drop
description: Voice feedback capture — sky-glass brand unified across marketing, capture, dashboard, and auth
status: sky-glass-brand-unified in globals.css
reference: Clubhouse iOS capture accents (Mobbin); Craft Web sky atmosphere
brandTokens:
  sky-soft: "oklch(0.92 0.04 240)"
  sky: "oklch(0.82 0.08 240)"
  paper: "oklch(0.97 0.008 245)"
  sand: "oklch(0.93 0.012 242)"
  ink: "oklch(0.18 0.01 245)"
  muted: "oklch(0.48 0.015 245)"
  mic: "oklch(0.22 0 0)"
  live: "oklch(0.72 0.19 155)"
  join: "oklch(0.62 0.19 255)"
  accent: "oklch(0.58 0.11 245)"
glass:
  bg: "oklch(1 0 0 / 0.55)"
  border: "oklch(1 0 0 / 0.65)"
  blur: "24px"
  saturate: "1.5"
colors:
  background: "oklch(0.985 0.008 245)"
  foreground: "oklch(0.18 0.01 245)"
  primary: "oklch(0.205 0.01 245)"
  primary-foreground: "oklch(0.985 0.008 245)"
  secondary: "oklch(0.96 0.01 245)"
  muted: "oklch(0.96 0.01 245)"
  muted-foreground: "oklch(0.48 0.015 245)"
  accent: "oklch(0.94 0.015 240)"
  destructive: "oklch(0.577 0.245 27.325)"
  border: "oklch(0.91 0.012 245)"
  ring: "oklch(0.68 0.04 245)"
  card: "oklch(0.995 0.006 245)"
  chart-1: "oklch(0.87 0 0)"
  chart-2: "oklch(0.556 0 0)"
  chart-3: "oklch(0.439 0 0)"
  chart-4: "oklch(0.371 0 0)"
  chart-5: "oklch(0.269 0 0)"
typography:
  ui:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  display:
    fontFamily: "Instrument Serif, ui-serif, Georgia, serif"
    fontSize: "2.35rem"
    fontWeight: 400
    lineHeight: 1.08
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "calc(0.625rem * 0.6)"
  md: "calc(0.625rem * 0.8)"
  lg: "0.625rem"
  xl: "calc(0.625rem * 1.4)"
  full: "9999px"
spacing:
  card: "1rem"
  card-sm: "0.75rem"
surfaces:
  brand: ".brand-surface"
  capture: ".capture-surface"
  glass-nav: ".glass-nav"
  glass-panel: ".glass-panel"
  glass-card: ".glass-card"
---

# Design System: Pulse Drop

## Overview

**Creative North Star: "The Encouraging Nudge"**

Pulse Drop's visual system is a **unified sky + glass brand** defined in `globals.css`. All customer-facing and operator surfaces share a cool sky gradient, frosted glass utilities, and cool-tinted shadcn tokens. Clubhouse-inspired capture accents (black mic, go-green live ring) layer on top for the hold-to-record flow.

The product has **one brand skin, three interaction densities**:

| Surface | Route | Wrapper | Character |
|---------|-------|---------|-----------|
| **Marketing** | `/` | `.brand-surface` | Editorial hero (Instrument Serif), sky decor, glass pill nav, auto-cycling product narrative |
| **Customer capture** | `/f/[locationId]` | `.capture-surface` | Mobile-first, bottom glass dock, 136px mic orb, go-green progress ring |
| **Operator dashboard** | `/dashboard/*` | `.brand-surface` | shadcn workflow density; glass nav + inbox cards on sky background |
| **Auth / onboarding** | `/sign-in`, `/sign-up`, `/dashboard/onboarding` | `.brand-surface` | Centered Clerk forms; onboarding uses `.glass-card` |
| **Story demo** | `/demo`, `/demo/qr` | `.brand-surface` | Scroll-driven pipeline using shared story primitives |

**Font stack:** Geist Sans for UI (`--font-geist-sans` → `--font-sans`). Instrument Serif for marketing display only (`--font-landing-display`, `.landing-display`). Geist Mono for code.

**Dark mode tokens exist** in `globals.css` but `next-themes` is not wired — light mode is the effective default. Clerk auth uses `shadcn` theme from `@clerk/ui/themes`.

**Key Characteristics:**

- Cool OKLCH sky gradient (`--brand-sky-soft` → `--brand-sky` → `--brand-paper`) on all branded pages
- Frosted glass utilities with 24px blur, 1.5× saturate, inset highlight — no wide ghost shadows
- shadcn v4 `base-nova` style, cool-tinted `:root` tokens (hue ~245)
- Clubhouse capture semantics: mic black idle, go-green live ring/waveform (not destructive red)
- Shared record primitives (`record-primitives.tsx`) used by capture and marketing narrative
- **Remaining gap:** chart palette is still achromatic; Duolingo/Headspace playfulness lives mainly in copy and micro-motion, not yet in analytics color

## Color Decision

**References:**

- **Clubhouse iOS** (Mobbin) — live room mic, go-green energy, mint/sky/sun delight accents on capture states
- **Craft Web** — cool sky atmosphere, frosted nav, editorial serif headline contrast

**Unified sky + glass (2026-06):** Marketing, capture, dashboard, and auth all use the brand layer. Shadcn semantic tokens in `:root` are cool-tinted to match. Capture maps Clubhouse accent tokens through `.capture-surface` aliases.

### Brand + glass tokens (`:root` / `.brand-surface`)

| Token | OKLCH | Role |
|-------|-------|------|
| `--brand-sky-soft` | `oklch(0.92 0.04 240)` | Gradient top, cloud glow |
| `--brand-sky` | `oklch(0.82 0.08 240)` | Gradient mid |
| `--brand-paper` | `oklch(0.97 0.008 245)` | Gradient base, card fill |
| `--brand-sand` | `oklch(0.93 0.012 242)` | Section borders, capture mid-gradient |
| `--brand-ink` | `oklch(0.18 0.01 245)` | Headings, primary text, CTA fill |
| `--brand-muted` | `oklch(0.48 0.015 245)` | Secondary text |
| `--brand-mic` | `oklch(0.22 0 0)` | Hold-to-record button (idle) |
| `--brand-live` | `oklch(0.72 0.19 155)` | Recording ring, waveform, success |
| `--brand-live-ring` | `oklch(0.72 0.19 155 / 0.35)` | Progress ring track |
| `--brand-accent` | `oklch(0.58 0.11 245)` | Story pipeline accent |
| `--brand-join` | `oklch(0.62 0.19 255)` | Links, secondary CTA |
| `--glass-bg` | `oklch(1 0 0 / 0.55)` | Frosted panel fill |
| `--glass-border` | `oklch(1 0 0 / 0.65)` | Frosted edge |
| `--glass-blur` | `24px` | Backdrop blur |
| `--glass-saturate` | `1.5` | Backdrop saturation boost |

`.brand-surface` also exposes landing/story aliases (`--landing-*`, `--story-accent`) for marketing and demo components.

### Glass utilities

| Class | Use |
|-------|-----|
| `.glass-nav` | Floating pill nav (marketing), sticky dashboard header |
| `.glass-panel` | Capture location pill, bottom record dock, phone frames, story vessels |
| `.glass-card` | Dashboard inbox cards, onboarding card, narrative inbox preview |

Glass uses inset top highlight + tight edge shadow — not stacked wide blurs. `.glass-card` uses 16px blur and higher opacity (`oklch(1 0 0 / 0.72)`) for readable content panels.

### Lottie assets (`public/lottie/`)

Product narrative animations (`qr-scan.json`, `voice-pulse.json`) are minimal programmatic Lottie JSON (~12KB combined), generated in-repo. Used in `ProductNarrative` beside phone-frame mocks. Style inspired by free [QR code](https://lottiefiles.com/free-animations/qr-code) and [microphone](https://lottiefiles.com/free-animations/microphone) community animations on LottieFiles (Lottie Simple License). Loaded client-side via `lottie-player.tsx` with `prefers-reduced-motion` respect.

### Capture (`/f/*`) — Clubhouse accents on sky

`.capture-surface` applies a sky-to-sand-to-paper gradient. Location pill and record dock use `.glass-panel`. Record control uses shared `RecordProgressRing` + `RecordingWaveform` from `record-primitives.tsx`.

| Token | Name | OKLCH | Role |
|-------|------|-------|------|
| `--capture-bg` | Sand | `var(--brand-sand)` | Page mid-tone |
| `--capture-card` | Paper | `var(--brand-paper)` | Focus ring offset |
| `--capture-sand` | Sand | `oklch(0.91 0.012 242)` | Input fills |
| `--capture-ink` | Ink | `var(--brand-ink)` | Headings, primary text |
| `--capture-muted` | Stone | `var(--brand-muted)` | Subtitles, timer, hints |
| `--capture-mic` | Mic Black | `var(--brand-mic)` | Hold-to-record button (idle) |
| `--capture-live` | Go Green | `var(--brand-live)` | Recording ring, waveform, success |
| `--capture-live-ring` | Go Green Ring | `var(--brand-live-ring)` | Progress ring track |
| `--capture-join` | Join Blue | `oklch(0.62 0.19 255)` | Links, optional secondary CTA |
| `--capture-peach` | Leave Peach | `oklch(0.62 0.12 45)` | Cancel, dismiss, warm accent |
| `--capture-mint` | Play Mint | `oklch(0.78 0.11 165)` | Positive delight accents |
| `--capture-sky` | Play Sky | `var(--brand-sky)` | Secondary delight accents |
| `--capture-sun` | Play Sun | `oklch(0.88 0.14 95)` | Highlights, encouragement badges |

| State | Colors / motion |
|-------|-----------------|
| Idle | Mic black orb; muted step labels; glass dock |
| Recording | Go-green progress ring + waveform bars; mic stays black, `scale-[1.04]` |
| Uploading | Spinner on mic; `opacity-60`; step 3 active |
| Success | Go-green check in soft green circle; `capture-done-enter` animation |
| Error | shadcn `--destructive` text only |

### Dashboard / marketing / auth — Sky + glass

Cool-tint shadcn tokens from `:root`. Pages wrapped in `.brand-surface`; nav uses `.glass-nav`, inbox and onboarding cards use `.glass-card`. Marketing hero CTA uses `.landing-hero-cta` (frosted white pill, not solid ink).

## Colors (Current Implementation)

A **cool-tinted** neutral system. Primary is near-black with a slight blue hue (~245). Backgrounds and cards carry subtle chroma toward sky blue. Saturated accents appear in capture live states and brand tokens; destructive remains orange-red for errors only.

### Primary

- **Cool Ink** (`oklch(0.205 0.01 245)`): Default button fill, badge default, marketing CTA text on frosted buttons.
- **Sky Paper** (`oklch(0.985 0.008 245)`): Text on primary surfaces, page background base.

### Secondary

- **Cool Whisper** (`oklch(0.96 0.01 245)`): Secondary buttons, muted accents, card footers.

### Accent

- **Sky Wash** (`oklch(0.94 0.015 240)`): Accent surfaces; story pipeline highlights via `--brand-accent`.

### Neutral

- **Paper White** (`oklch(0.995 0.006 245)`): Card surface, popover.
- **Ink Text** (`oklch(0.18 0.01 245)`): Body copy, headings.
- **Cool Stone** (`oklch(0.48 0.015 245)`): Secondary text, chart axis labels, capture subtitles.
- **Sky Border** (`oklch(0.91 0.012 245)`): Borders, inputs, dividers.
- **Focus Ring** (`oklch(0.68 0.04 245)`): Focus-visible rings at 50% opacity.

### Chart

- **Grayscale Ramp** (`chart-1` through `chart-5`): Analytics charts only. No hue differentiation yet — sentiment/category charts need a warmer branded palette in a future pass.

### Named Rules

**The Token Source Rule.** All colors come from CSS variables in `globals.css`. Components reference `--brand-*`, `--capture-*`, or shadcn semantic tokens — never hardcoded hex/OKLCH in JSX.

**The Go-Green Live Rule.** Recording state uses `--capture-live` / `--brand-live`, not `--destructive`. Reserve destructive for errors and warnings only.

**The Glass Restraint Rule.** Glass belongs on nav, docks, and elevated cards — not every element. One inset highlight per glass surface; avoid stacking wide outer shadows.

## Typography

**UI Font:** Geist Sans (`--font-geist-sans` in `layout.tsx` → `--font-sans`)
**Display Font:** Instrument Serif (`--font-landing-display`) — marketing hero only via `.landing-display`
**Mono Font:** Geist Mono (`--font-geist-mono`)
**Heading alias:** `--font-heading` → Geist Sans (dashboard cards, capture headings)

**Character:** Geist is geometric and dense for dashboard workflow. Instrument Serif gives editorial warmth on the landing hero — sparse use preserves contrast with UI type.

### Hierarchy

- **Display** (Instrument Serif, 400, ~2.35rem / `text-[2.35rem]`, line-height 1.08): Marketing hero headline only.
- **Title** (Geist 500–600, 1.75rem / `text-[1.75rem]`, line-height 1.12): Capture prompt, thank-you heading.
- **Body** (Geist 400, 0.875rem / `text-sm`, line-height 1.5): Default UI copy, card content, button labels.
- **Label** (Geist 500, 0.75rem / `text-xs`, line-height 1.4): Badges, capture timer, location pill, step labels.
- **Mono** (Geist Mono 400, 0.875rem): Code and data literals.

### Named Rules

**The Geist Stack Rule.** All UI text uses Geist Sans unless explicitly monospace via `font-mono` or display via `.landing-display`.

**The Serif Sparingly Rule.** Instrument Serif appears on the marketing h1 only. Do not spread serif to dashboard or capture — it marks the editorial marketing moment.

## Elevation

Depth is conveyed through **glass layering** and tonal gradient, not heavy drop shadows.

- **Sky gradient:** Primary page depth — `brand-surface` and `capture-surface` vertical gradients.
- **Glass panels:** Inset top highlight (`oklch(1 0 0 / 0.35)`) on `.glass-panel`; `.glass-nav` adds a 1px bottom hairline.
- **Cards (dashboard):** `.glass-card` with 16px blur; selected inbox row adds `ring-2 ring-primary`.
- **shadcn cards (default):** `ring-1 ring-foreground/10` when not using glass variant.
- **Capture mic orb:** No shadow at idle; `scale-[1.04]` when recording; `active:scale-[0.94]` on press.
- **Marketing CTA:** `.landing-hero-cta` — frosted fill with 4px outer glow ring, not `shadow-lg`.

Dark mode uses semi-transparent borders (`oklch(1 0 0 / 10%)`) instead of shadow for surface separation.

### Named Rules

**The Glass-Not-Ghost Rule.** Frosted surfaces use blur + inset highlight. Do not pair glass with 40–60px outer blur shadows (common slop tell).

## Motion

- **Capture:** `capture-done-enter` (320ms ease-out translateY); ring progress `stroke-dashoffset` transition; step label color transitions (180ms).
- **Marketing narrative:** Auto-cycling stages (3–4s each) in `ProductNarrative`; respects `prefers-reduced-motion` via hook.
- **Lottie:** Looping QR and voice animations beside phone mocks; disabled when reduced motion preferred.
- **Story pipeline (`/demo`):** Scroll-driven scene transitions in `story-pipeline.tsx`; story tokens in `story-tokens.css`.

All new animations must gate on `prefers-reduced-motion`.

## Components

### Buttons (shadcn)

- **Shape:** Gently rounded corners (`rounded-lg`, 10px base radius). Marketing CTAs use `rounded-full`.
- **Primary:** `bg-primary text-primary-foreground`, height 32px (`h-8`), `text-sm font-medium`.
- **Marketing nav CTA:** `bg-[var(--brand-ink)]` pill on glass nav.
- **Hero CTA:** `.landing-hero-cta` frosted white pill — not shadcn primary.
- **Hover:** `bg-primary/80`. **Focus:** `ring-3 ring-ring/50` + `border-ring`.
- **Active:** `translate-y-px` press on dashboard buttons; capture mic uses scale.

### Badges

- **Shape:** Full pill (`rounded-4xl`), height 20px (`h-5`).
- **Default:** `bg-primary text-primary-foreground`.
- **Sentiment (narrative/demo):** `bg-[var(--brand-live)]/12 text-[var(--brand-live)]` for positive highlights.
- **Destructive:** `bg-destructive/10 text-destructive` — tinted, not solid fill.

### Cards / Containers

- **Dashboard inbox:** `.glass-card` on `.brand-surface` background.
- **Onboarding:** `.glass-card w-full max-w-sm`.
- **Default shadcn:** `rounded-xl`, `ring-1 ring-foreground/10`, `--card-spacing: 1rem`.
- **Phone frame (marketing):** `.glass-panel` with `rounded-[2rem]` outer, `rounded-[1.35rem]` inner screen.

### Charts

- **Wrapper:** `ChartContainer` with `aspect-video`, `text-xs`.
- **Colors:** `chart-1`–`chart-5` grayscale ramp — needs brand color pass.
- **Grid/axis:** `stroke-border/50`, tick text `fill-muted-foreground`.

### Capture Hold-to-Record (signature component)

- **Shape:** Circle, 136px (`DEFAULT_RECORD_SIZE`), `rounded-full`.
- **Idle:** `bg-[var(--capture-mic)]` black orb with white Mic icon; go-green ring hidden.
- **Recording:** Black mic + visible `RecordProgressRing` in go-green; `RecordingWaveform` below; `scale-[1.04]`.
- **Uploading:** `Loader2` spinner; `opacity-60`, disabled.
- **Success:** 56px check circle with `bg-[var(--capture-live-soft)]`; bottom-aligned thank-you copy.
- **Layout:** Full viewport (`min-h-dvh`), top prompt + bottom `.capture-dock` glass panel.
- **A11y:** `aria-label`, `aria-describedby`, `role="status"` + `aria-live="polite"` on status text.

### Marketing Product Narrative

- **Location:** `#product` section in `landing-page.tsx` via `ProductNarrative`.
- **Stages:** Scan (Lottie QR + phone QR) → Record (Lottie voice + mini mic mock) → Inbox (glass inbox preview).
- **Cycle:** Auto-advances every 3–4s; dot indicators; pauses respect reduced motion.

### Story Pipeline (`/demo`)

- **Primitives:** `story-stage.tsx`, `record-orb.tsx`, `voice-packet.tsx`, `inbox-card-preview.tsx`, etc.
- **Tokens:** `story-tokens.css` extends `.brand-surface` with `--story-accent` and vessel glass styles.
- **Purpose:** Scroll-driven product story for sales/demo; shares record ring and waveform patterns with capture.

## Do's and Don'ts

### Do:

- **Do** use semantic tokens (`--brand-*`, `--capture-*`, `bg-primary`, `text-muted-foreground`) — never hardcode hex/OKLCH in components.
- **Do** wrap branded pages in `.brand-surface` or `.capture-surface` as appropriate.
- **Do** apply glass utilities to nav, docks, and elevated cards — one glass layer per elevation level.
- **Do** keep the capture flow minimal: one focal control, 136px touch target, clear status text below the orb.
- **Do** use go-green (`--capture-live`) for recording state — pair with ring, waveform, scale, and label text.
- **Do** respect `prefers-reduced-motion` on all animations (capture, Lottie, narrative cycling, story pipeline).
- **Do** target WCAG 2.1 AA contrast; verify `brand-muted` on sky gradient backgrounds.
- **Do** reuse `record-primitives.tsx` when building new record UI (marketing, story, capture).

### Don't:

- **Don't** use generic SaaS landing templates: cream/sand body backgrounds, gradient text, eyebrow kickers on every section, hero-metric blocks, identical icon-card grids.
- **Don't** adopt enterprise-heavy density: navy/gold fintech clichés, stock-photo corporate tone.
- **Don't** use cold brutalist or terminal-native aesthetics that fight the friendly voice.
- **Don't** use destructive red for recording state — that reads as error, not live.
- **Don't** stack wide ghost shadows on glass elements — use inset highlight only.
- **Don't** spread Instrument Serif beyond the marketing hero.
- **Don't** invent new accent colors in agent-generated screens until tokens are added to `globals.css`.
- **Don't** rely on color alone for recording state — pair go-green ring with scale, waveform, and label text.

## Variant Landing Gallery

The app now includes a campaign gallery under `/landings` with 15 static route variants at `/landings/[slug]`.

- Shared catalog: `src/components/marketing/landing-variants.ts`
- Shared renderer: `src/components/marketing/variant-landing-page.tsx`
- Route entries: `src/app/landings/page.tsx`, `src/app/landings/[slug]/page.tsx`
- Shared skin: `src/app/globals.css` via the `landing-*` utility classes

Each variant keeps the same CTA system and proof model, but changes the hero, section order, tone, and palette so the page family reads as a set of distinct product bets rather than palette swaps.
