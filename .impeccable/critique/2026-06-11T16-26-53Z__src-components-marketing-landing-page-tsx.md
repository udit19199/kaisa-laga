---
target: landing page (sky/glass direction, remove slop)
total_score: 24
p0_count: 0
p1_count: 4
p2_count: 2
timestamp: 2026-06-11T16-26-53Z
slug: src-components-marketing-landing-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Nav links to `#pricing` and `#learn` scroll nowhere; no section exists |
| 2 | Match System / Real World | 3 | Headline and card copy read naturally for operators |
| 3 | User Control and Freedom | 3 | Standard escape paths (Log in, home); no traps |
| 4 | Consistency and Standards | 2 | Landing is Craft sky/glass; capture is warm Clubhouse paper; dashboard is neutral shadcn — three skins |
| 5 | Error Prevention | 3 | Static marketing surface; low risk |
| 6 | Recognition Rather Than Recall | 2 | Dead anchors force guessing; mobile hides most nav |
| 7 | Flexibility and Efficiency | 2 | No skip paths beyond primary CTA |
| 8 | Aesthetic and Minimalist Design | 2 | Collage + clouds + waves + 6-card grid + 3 step cards compete for attention |
| 9 | Error Recovery | 3 | n/a on static page |
| 10 | Help and Documentation | 2 | "Learn" nav item promises content that is not on the page |
| **Total** | | **24/40** | **Acceptable — significant polish before this reads as intentional brand** |

**Cognitive load:** 3 checklist failures (chunking, visual hierarchy in hero band, visual noise). The product preview alone presents 6 same-shaped cards with uppercase micro-labels — working-memory overload for a first visit.

## Anti-Patterns Verdict

**LLM assessment: Yes — reads AI/Craft-template at first glance.**

The sky gradient, frosted nav, and serif headline successfully echo the Craft reference you attached. What pushes this into slop territory is everything layered on top: torn-paper SVG collage (`TornPaperCollage`), numbered `01 / 02 / 03` step cards, two identical icon+heading+body card grids (6 inbox tiles + 3 how-it-works tiles), ghost-card styling (1px border paired with 16–40px blur shadows on nav, CTA, and device frame), and uppercase tracked labels on every preview card. That combination matches PRODUCT.md's own anti-references almost verbatim.

The torn-paper collage is the loudest tell — it is decorative scenery with no narrative job for Pulse Drop (voice feedback, not notes/tasks). Your instinct to drop "the slop" while keeping sky/glass is correct: the collage is the part to cut first, not the atmosphere.

Glass is intentional per your brief — keep it, but use it on one or two surfaces (nav + primary CTA), not as a default texture on every elevated element.

**Deterministic scan:** `detect.mjs` on `landing-page.tsx` returned **0 findings** (exit 0). The bundled rules did not flag this file; manual review carries the anti-pattern verdict.

## Overall Impression

You are halfway to a distinctive sky/glass brand: the gradient, clouds, glass nav, and Instrument Serif headline have real Craft energy. The page then undermines itself by stapling on every landing-page trope (collage, numbered steps, pastel card grid, fake dashboard density). The single biggest opportunity: **commit to atmospheric sky/glass and delete the scrapbook layer** — then simplify the product proof to one focused mock, not six identical tiles.

## What's Working

1. **Sky atmosphere** — `landing-surface` gradient (`sky-soft` → `sky` → `paper`) and soft cloud glow establish the airy mood you want to carry globally.
2. **Glass nav** — `landing-glass-nav` (blur + translucent white) is the right anchor for a floating pill header; it matches your reference without needing the collage.
3. **Serif hero voice** — Instrument Serif on the h1 gives editorial weight against Geist UI type in the mockup; good Craft-style contrast if you keep display serif deliberate and sparse.

## Priority Issues

### [P1] Torn-paper collage is pure decorative slop
- **Why it matters:** Adds visual noise, fights the calm sky mood, and copies Craft's scrapbook layer without Pulse Drop's product story. Operators scanning for trust see clip-art, not voice CX.
- **Fix:** Remove `TornPaperCollage` entirely. Let the product mockup sit on open sky with generous whitespace (as in Craft's cleaner zones). Optional: one subtle horizon line or a single cloud — not five overlapping SVG shards.
- **Suggested command:** `$impeccable distill landing-page`

### [P1] Numbered step cards (`01 / 02 / 03`) + identical 3-column grid
- **Why it matters:** Numbered section eyebrows on a 3-step flow is an impeccable absolute ban and PRODUCT.md anti-pattern. Three same-shaped cards with icon circles is the identical-card-grid tell.
- **Fix:** Replace with a single horizontal flow (scan → transcribe → alert) using line/connectors or one sentence under the hero — no step numbers, no three matching boxes.
- **Suggested command:** `$impeccable distill how-it-works section`

### [P1] Six-tile identical inbox grid in product preview
- **Why it matters:** Reads as filler dashboard, not proof. Pastel header strips + uppercase status labels on every card = hero-metric-grid cousin. Cognitive load spikes on first paint.
- **Fix:** Show **one** inbox row or **two** contrasting items (negative alert + positive mention) with real Pulse Drop UI patterns. Drop the traffic-light dots and macOS chrome if they are not shipping.
- **Suggested command:** `$impeccable shape product preview mock`

### [P1] Dead navigation anchors
- **Why it matters:** `#pricing` and `#learn` break trust for Jordan/Riley personas; looks unfinished.
- **Fix:** Remove links until sections exist, or ship minimal real sections. Do not leave ghost IA.
- **Suggested command:** `$impeccable clarify nav`

### [P2] Ghost-card shadow pattern on glass elements
- **Why it matters:** `landing-glass-nav`, `landing-hero-cta`, and `landing-device-shadow` pair borders with wide soft shadows (12–60px blur). Codex-specific slop tell; muddies the glass material.
- **Fix:** Pick border **or** shadow per surface. Nav: border + light inset highlight only. Device frame: one tight shadow, no hairline border.
- **Suggested command:** `$impeccable quieter glass + device chrome`

### [P2] Split palette: warm Clubhouse sand on a sky page
- **Why it matters:** `--landing-paper`, `--landing-sand`, warm peach/mint accents clash with the cool sky gradient. PRODUCT.md warns against cream/sand marketing bodies; you are straddling warm capture tokens and cool Craft sky.
- **Fix:** When going global sky/glass, retint neutrals toward blue hue (OKLCH chroma 0.005–0.015 toward 235–250), keep saturated accents for sentiment only. Phase 1 on landing: cool paper/sand tokens inside `.landing-surface` only.
- **Suggested command:** `$impeccable colorize landing tokens toward sky`

## Persona Red Flags

**Jordan (First-Timer):** Clicks "Pricing" or "Learn" and lands on empty page sections. Headline says "voice feedback" but collage suggests a notes app. No single sentence explaining QR → record → inbox.

**Riley (Stress Tester):** Six fabricated feedback categories imply analytics depth that may not match MVP. Inconsistent brand between `/` (sky/glass), `/f/*` (warm paper), `/dashboard/signup` (plain white shadcn card).

**Casey (Mobile):** Collage + mockup stack increases scroll height and visual clutter on narrow viewports; thumb reaches CTA but proof section is dense.

**Morgan (Café operator, project-specific):** Torn paper and pastel tiles feel consumer-playful, not "check between shifts." Wants one sharp alert example, not a candy grid.

## Minor Observations

- `PULSE DROP` logotype in wide-tracked all-caps reads template; sentence case or a wordmark lockup would feel more ownable.
- Decorative wavy line SVG in `SkyDecor` adds little once collage is gone; consider removing or merging into one cloud system.
- `feTurbulence` cloud grain is fine Craft homage; keep only if performance and reduced-motion are tested.
- Hero CTA `hover:scale-[1.02]` lacks reduced-motion guard (PRODUCT.md requires it).
- `rounded-[1.35rem]` and `rounded-2xl` on cards are at the high end of radius scale; 12–16px max for cards per impeccable guidance.

## Questions to Consider

- What if the hero showed **one** real inbox alert instead of six placeholder cards?
- Does how-it-works need its own section, or could three verbs live in the subhead?
- If sky/glass goes global, does warm Clubhouse capture stay as a deliberate "customer room" contrast, or unify everything cool-blue?
