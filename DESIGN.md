---
name: PulseDrop
description: Voice feedback capture — Clubhouse-inspired capture colors, neutral dashboard
status: capture-colors-applied in globals.css
reference: Clubhouse iOS (Mobbin)
captureColors:
  paper: "oklch(0.97 0.008 85)"
  sand: "oklch(0.92 0.012 75)"
  ink: "oklch(0.18 0 0)"
  muted: "oklch(0.58 0.01 0)"
  mic: "oklch(0.22 0 0)"
  go-green: "oklch(0.72 0.19 155)"
  join-blue: "oklch(0.62 0.19 255)"
  leave-peach: "oklch(0.62 0.12 45)"
  play-mint: "oklch(0.78 0.11 165)"
  play-sky: "oklch(0.72 0.10 240)"
  play-sun: "oklch(0.88 0.14 95)"
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  primary: "oklch(0.205 0 0)"
  primary-foreground: "oklch(0.985 0 0)"
  secondary: "oklch(0.97 0 0)"
  secondary-foreground: "oklch(0.205 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  accent: "oklch(0.97 0 0)"
  accent-foreground: "oklch(0.205 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  destructive-foreground: "oklch(0.985 0 0)"
  border: "oklch(0.922 0 0)"
  ring: "oklch(0.708 0 0)"
  card: "oklch(1 0 0)"
  chart-1: "oklch(0.87 0 0)"
  chart-2: "oklch(0.556 0 0)"
  chart-3: "oklch(0.439 0 0)"
  chart-4: "oklch(0.371 0 0)"
  chart-5: "oklch(0.269 0 0)"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
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
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
    height: "2rem"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
  card-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
  badge-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    height: "1.25rem"
    padding: "0 0.5rem"
  capture-record-idle:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    size: "8rem"
  capture-record-active:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    rounded: "{rounded.full}"
    size: "8rem"
---

# Design System: PulseDrop

## Overview

**Creative North Star: "The Encouraging Nudge"**

PulseDrop's current visual system is the **default neutral shadcn `base-nova` preset** — a clean, achromatic OKLCH palette with Geist typography and modest corner radii. It reads as competent SaaS infrastructure, not yet as the friendly, playful, Headspace/Duolingo energy described in `PRODUCT.md`. This document captures the **honest baseline** so agents know what exists today and where the gap is.

The product has **two surfaces** with different visual dialects:

1. **Dashboard** (`/dashboard/*`) — full shadcn component library: buttons, cards, badges, charts, tables, sidebar tokens. Workflow-dense, neutral, ring-bordered cards.
2. **Customer capture** (`/f/[locationId]`) — minimal custom UI: centered layout, semantic tokens, and a large circular hold-to-record control with state-driven color and scale transitions.

Marketing (`/`) is a thin shell (title + two CTAs) inheriting the same neutral tokens. **Dark mode tokens exist** in `globals.css` but `next-themes` is not wired — light mode is the effective default.

**Known bug:** `@theme inline` sets `--font-sans: var(--font-sans)` (circular reference). `layout.tsx` loads Geist as `--font-geist-sans` but never maps it to `--font-sans`. Intended stack: Geist Sans body/heading, Geist Mono for code.

**Key Characteristics:**

- Neutral OKLCH grayscale palette — zero chroma on primary/secondary/muted
- shadcn v4 `base-nova` style, `neutral` base color (`components.json`)
- Base radius `0.625rem` (10px) with computed scale (`sm`–`4xl`)
- Flat elevation — depth via `ring-1 ring-foreground/10` on cards, not box-shadow
- Dual-surface: shadcn dashboard vs custom circular capture control
- **Gap:** palette and motion do not yet express friendly/playful/light brand direction

## Color Decision

**Reference:** Clubhouse iOS on Mobbin — live rooms, go-live sheet, discover feed ([example](https://mobbin.com/screens/fac47dd5-3340-4c24-b934-d37cf0c5758a)).

**Split:** Clubhouse palette on **customer capture only** (`/f/*`). **Dashboard, marketing, auth** keep the neutral shadcn baseline below. No token migration for operator UI.

### Capture (`/f/*`) — Clubhouse

Warm paper room, black mic, green “live” energy, mint/sky/sun accents on delight moments.

| Token | Name | OKLCH | Role |
|-------|------|-------|------|
| `--capture-bg` | Paper | `oklch(0.97 0.008 85)` | Page background |
| `--capture-sand` | Sand | `oklch(0.92 0.012 75)` | Location pill, cards, input fills |
| `--capture-ink` | Ink | `oklch(0.18 0 0)` | Headings, primary text |
| `--capture-muted` | Stone | `oklch(0.58 0.01 0)` | Subtitles, timer, hints |
| `--capture-mic` | Mic Black | `oklch(0.22 0 0)` | Hold-to-record button (idle) |
| `--capture-live` | Go Green | `oklch(0.72 0.19 155)` | Recording ring, waveform, success |
| `--capture-join` | Join Blue | `oklch(0.62 0.19 255)` | Links, optional secondary CTA |
| `--capture-peach` | Leave Peach | `oklch(0.62 0.12 45)` | Cancel, dismiss, warm accent text |
| `--capture-mint` | Play Mint | `oklch(0.78 0.11 165)` | Positive delight accents |
| `--capture-sky` | Play Sky | `oklch(0.72 0.10 240)` | Secondary delight accents |
| `--capture-sun` | Play Sun | `oklch(0.88 0.14 95)` | Highlights, encouragement badges |

| State | Colors |
|-------|--------|
| Idle | Mic Black on Paper; Sand location pill |
| Recording | Go Green ring + waveform; mic stays black |
| Success | Go Green check; mint/sun accents sparingly |
| Error | shadcn `--destructive` only |

### Dashboard / marketing / auth — Normal

No change. Keep achromatic shadcn tokens from `:root` below.

## Colors (Current Implementation)

A fully desaturated neutral system. Primary is near-black on white — functional, not warm. The only saturated token is **destructive** (orange-red, used for errors and active recording state).

### Primary

- **Ink Black** (`oklch(0.205 0 0)`): Default button fill, capture idle record button, badge default, link text. The de-facto accent — but achromatic, not brand-warm.
- **Paper White** (`oklch(0.985 0 0)`): Text on primary surfaces.

### Secondary

- **Whisper Gray** (`oklch(0.97 0 0)`): Secondary buttons, muted accents, card footers (`bg-muted/50`). Barely distinguishable from background.

### Tertiary

- Omitted — no third chromatic role exists in the token set.

### Neutral

- **Pure White** (`oklch(1 0 0)`): Page background, card surface, popover.
- **Charcoal Text** (`oklch(0.145 0 0)`): Body copy, headings.
- **Stone Muted** (`oklch(0.556 0 0)`): Secondary text, chart axis labels, capture subtitles.
- **Feather Border** (`oklch(0.922 0 0)`): Borders, inputs, dividers.
- **Focus Ring** (`oklch(0.708 0 0)`): Focus-visible rings at 50% opacity on buttons and badges.

### Chart

- **Grayscale Ramp** (`chart-1` through `chart-5`, `oklch(0.87 0 0)` → `oklch(0.269 0 0)`): Analytics charts only. No hue differentiation — sentiment/category charts will need a warmer palette to match brand.

### Named Rules

**The Neutral Baseline Rule.** Document what exists, not what we wish existed. Until a colorize pass, treat the achromatic palette as the source of truth — agents must not invent warm accent colors without an explicit token update.

**The One Saturated Token Rule.** Destructive (`oklch(0.577 0.245 27.325)`) is the only hue in the light palette. Reserve it for errors, warnings, and active recording — never as a brand accent.

## Typography

**Display / Body Font:** Geist Sans (`--font-geist-sans` in `layout.tsx`; intended via `--font-sans`)
**Mono Font:** Geist Mono (`--font-geist-mono`)
**Heading alias:** `--font-heading` → `--font-sans`

**Character:** Geometric, modern, Vercel-adjacent. Clean and legible at small sizes — good for dashboard density. Does not yet carry the rounded, encouraging warmth of Duolingo/Headspace references.

### Hierarchy

- **Display** (600, 1.5rem / `text-2xl`, line-height 1.25): Capture page titles, thank-you headings.
- **Title** (500, 1rem / `text-base`, line-height 1.375): Card titles via `font-heading`.
- **Body** (400, 0.875rem / `text-sm`, line-height 1.5): Default UI copy, card content, button labels.
- **Label** (500, 0.75rem / `text-xs`, line-height 1.4): Badges, capture timer, location name.
- **Mono** (400, 0.875rem): Code and data literals (when used).

### Named Rules

**The Geist Stack Rule.** All UI text uses Geist Sans unless explicitly monospace. Fix the `--font-sans` circular reference to `var(--font-geist-sans)` before relying on `font-sans` utilities.

## Elevation

This system is **flat by default**. Depth is conveyed through tonal layering (background → card → muted footer) and subtle rings, not shadows.

- **Cards:** `ring-1 ring-foreground/10` — a hairline ring at 10% foreground opacity, no `box-shadow`.
- **Capture record button (idle):** `shadow-md` — the only prominent shadow in the capture flow.
- **Capture record button (recording):** `shadow-lg` + `scale-110` — elevation increases with active state.
- **Buttons:** `active:translate-y-px` micro-press on dashboard buttons; capture uses `active:scale-95`.

No global shadow token scale exists in `globals.css`. Dark mode uses semi-transparent borders (`oklch(1 0 0 / 10%)`) instead of shadow for surface separation.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as state feedback (capture button, hover lifts). Do not add drop shadows to dashboard cards.

## Components

### Buttons (shadcn)

- **Shape:** Gently rounded corners (`rounded-lg`, 10px base radius).
- **Primary:** `bg-primary text-primary-foreground`, height 32px (`h-8`), horizontal padding 10px, `text-sm font-medium`.
- **Hover:** `bg-primary/80`. **Focus:** `ring-3 ring-ring/50` + `border-ring`.
- **Outline:** `border-border bg-background`, hover fills `bg-muted`.
- **Secondary:** `bg-secondary`, hover uses OKLCH color-mix.
- **Ghost / Destructive / Link:** Standard shadcn `base-nova` variants.
- **Active:** `translate-y-px` press on non-popup buttons.

### Badges

- **Shape:** Full pill (`rounded-4xl`), height 20px (`h-5`), horizontal padding 8px.
- **Default:** `bg-primary text-primary-foreground`.
- **Destructive:** `bg-destructive/10 text-destructive` — tinted, not solid fill.
- **Focus:** `ring-[3px] ring-ring/50`.

### Cards / Containers

- **Corner Style:** `rounded-xl` (14px, `--radius-xl`).
- **Background:** `bg-card` on `bg-background` page.
- **Border:** `ring-1 ring-foreground/10` — no solid border color.
- **Internal Padding:** `--card-spacing: 1rem` (default), `0.75rem` for `size="sm"`.
- **Footer:** `border-t bg-muted/50` tonal strip.

### Charts

- **Wrapper:** `ChartContainer` with `aspect-video`, `text-xs`.
- **Colors:** Pulled from `chart-1`–`chart-5` CSS variables via inline `<style>` injection.
- **Grid/axis:** `stroke-border/50`, tick text `fill-muted-foreground`.
- **Tooltip cursor:** `fill-muted`.

### Capture Hold-to-Record (signature component)

- **Shape:** Circle, 128px (`size-32`), `rounded-full`.
- **Idle:** `bg-primary text-primary-foreground shadow-md`, `active:scale-95`.
- **Recording:** `bg-destructive text-destructive-foreground shadow-lg scale-110` — color + scale + shadow change (not color-only; good for a11y, but needs aria labels).
- **Uploading:** `opacity-50`, disabled.
- **Success:** 80px circle (`size-20`) with `bg-primary/10` and checkmark emoji.
- **Layout:** Full viewport (`min-h-dvh`), centered column, `gap-8`, `px-6`.

## Do's and Don'ts

### Do:

- **Do** use semantic tokens (`bg-primary`, `text-muted-foreground`, `bg-destructive`) — never hardcode hex/OKLCH in components.
- **Do** keep the capture flow minimal: one focal control, large touch target (128px), clear text state below the button.
- **Do** use `ring-1 ring-foreground/10` for card boundaries — match existing dashboard pattern.
- **Do** respect `prefers-reduced-motion` when adding animations (capture currently uses `transition-all` and scale — gate in a polish pass).
- **Do** target WCAG 2.1 AA contrast; the neutral palette generally passes, but verify `muted-foreground` on `background`.
- **Do** maintain one brand across `/`, `/f/*`, and `/dashboard/*` — warmth should come through copy and micro-interactions even before a full colorize.

### Don't:

- **Don't** use generic SaaS landing templates: cream/sand body backgrounds, gradient text, eyebrow kickers on every section, hero-metric blocks (big number + small label), identical icon-card grids.
- **Don't** adopt enterprise-heavy density: navy/gold fintech clichés, stock-photo corporate tone.
- **Don't** use cold brutalist or terminal-native aesthetics that fight the friendly voice.
- **Don't** add decorative shadows, glassmorphism, or gradient heroes to close the brand gap — use `$impeccable colorize` and `craft` instead of one-off styling.
- **Don't** rely on color alone for recording state — pair destructive fill with scale, shadow, and label text changes.
- **Don't** invent warm accent colors in agent-generated screens until tokens are updated in `globals.css`.
