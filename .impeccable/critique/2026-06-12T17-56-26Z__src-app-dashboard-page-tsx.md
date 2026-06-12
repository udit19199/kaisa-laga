---
target: dashboard (sky/glass direction, remove solid container blockiness)
total_score: 23
p0_count: 0
p1_count: 3
p2_count: 3
timestamp: 2026-06-12T17:56:26Z
slug: src-app-dashboard-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No visual indicator for background polling status; silent refreshes feel unstable |
| 2 | Match System / Real World | 3 | Key metrics ("Positive Rate", "Negative Feedback") map well to operator vocabulary |
| 3 | User Control and Freedom | 3 | Easy dropdown filters for timeframes and locations |
| 4 | Consistency and Standards | 1 | Complete departure from the brand's sky/glass theme. Missing `.brand-surface` background, uses solid white cards and a standard grey border header |
| 5 | Error Prevention | 3 | Clean select inputs prevent invalid filter combinations; operations are safe |
| 6 | Recognition Rather Than Recall | 2 | Daily trend lines use hardcoded color values in JSX; sparkline trends are unlabelled and have unexplained color logic |
| 7 | Flexibility and Efficiency | 2 | Static table rows and chart items lack click-through filters to deep-dive into relevant inbox feedback |
| 8 | Aesthetic and Minimalist Design | 2 | Achromatic and flat layout feels like a generic template; squished sparklines are crammed into KPI footer zones |
| 9 | Error Recovery | 3 | Error toast messages are wired up correctly for failed location actions |
| 10 | Help and Documentation | 2 | Empty state suggests deploying QR codes but lacks direct action links to the Locations page |
| **Total** | | **23/40** | **Acceptable — functional dashboard, but lacks brand personality and visual depth** |

**Cognitive load:** 2 checklist failures (brand context mismatch, dense sparkline representation). A first-time business operator arriving from the warm/cool onboarding flow is jarred by a cold, flat shadcn dashboard. The sparklines lack labels, forcing the user to recall what each mini-trend represents.

## Anti-Patterns Verdict

**LLM assessment: Yes — reads as standard boilerplate shadcn UI, clashing with the custom sky-glass brand.**

The dashboard completely drops the visual identity defined in `DESIGN.md`. While the landing page, onboarding page, and capture screen establish a premium atmosphere of gradients, frosted glass navs, and soft cloud backdrops, the dashboard feels like a generic SaaS template. It reverts to standard solid-color card surfaces (`bg-card`), plain border dividers (`border-b`), and solid primary button fills. The visual depth conveyed through glass layering is completely absent, breaking the core brand promise of Pulse Drop.

Furthermore, the code has hardcoded OKLCH color strings for chart rendering lines (e.g. `oklch(0.72 0.19 155)` for Positive sentiment) rather than retrieving them from CSS theme variables or matching standard brand variables. This directly violates the **Token Source Rule** specified in `DESIGN.md`.

## Overall Impression

The dashboard is robustly functional and performs background updates correctly. However, it completely fails to deliver the unified **sky + glass brand** experience. By not wrapping the main layout in a `LiquidGlassProvider` with `.brand-surface` and using solid cards instead of `.glass-card`, the application isolates its core admin interface into a separate, unbranded aesthetic. Aligning the layout headers to `.glass-nav`, converting charts/KPI containers to `.glass-card`, and mapping lines to semantic CSS tokens will elevate this screen to match the landing page.

## What's Working

1. **Robust Empty States** — The empty trend and category states display welcoming illustrations with actionable advice.
2. **Smooth Background Polling** — Polling runs silently in the background without causing flashing skeleton states.
3. **Flexible Date/Location Filters** — Quick switching of location parameters is handled cleanly with state hooks.

## Priority Issues

### [P1] Missing `.brand-surface` on Dashboard Layout
- **Why it matters:** Breaks core aesthetic cohesion. The operator transitions from onboarding (sky-glass) to a stark white/gray dashboard page, clashing with the visual identity guidelines in `DESIGN.md`.
- **Fix:** Wrap the main dashboard content panel in `LiquidGlassProvider` with `.brand-surface` in `src/app/dashboard/(main)/layout.tsx`.
- **Suggested command:** `$impeccable paint dashboard-layout`

### [P1] KPI and Analytics Containers Use Solid Cards instead of Glass
- **Why it matters:** Solid `<Card>` elements block the sky gradient backdrop. The design system explicitly mandates `.glass-card` for elevated admin panels.
- **Fix:** Replace all standard UI card elements (`Card`, `CardHeader`, `CardTitle`, `CardContent`) on the Overview page and Settings page with `GlassCard` wrapper components.
- **Suggested command:** `$impeccable glassify cards`

### [P1] Hardcoded OKLCH Colors on Analytics Charts
- **Why it matters:** Directly violates the **Token Source Rule** in `DESIGN.md`. Chart colors are hardcoded inside JSX, preventing clean dark/light mode scaling and theme overrides.
- **Fix:** Replace inline oklch strings in the `LineChart` and `Sparkline` color props with CSS variables (e.g., `var(--brand-live)`, `var(--brand-accent)`).
- **Suggested command:** `$impeccable tokenize chart-colors`

### [P2] Sparklines Lack Semantic Accessibility Labels
- **Why it matters:** Screen readers will bypass or announce empty SVGs, creating accessibility barriers for impaired operators.
- **Fix:** Add `role="img"` and `aria-label` to the `Sparkline` SVG components, and include hidden description tags for screen reader reading of trend statistics.
- **Suggested command:** `$impeccable clarify sparkline-a11y`

### [P2] Sparkline Colors and Trends are Unlabeled
- **Why it matters:** Forces operators to guess the trend meaning. The Active Locations card renders a sparkline based on `neutralSeries` in a dark gray line, creating confusion about what the trend line denotes.
- **Fix:** Add a small subtitle label indicating the trend type (e.g., "7d volume trend" or "Daily positive rate trend") and match sparkline colors to their semantic attributes (e.g., positive rate sparkline in green, negative rate sparkline in red).
- **Suggested command:** `$impeccable label sparklines`

### [P2] Lack of Table Row Interactions and Deep Filtering
- **Why it matters:** Friction in analytics workflows. An operator viewing the "Locations Breakdown" table has to manually navigate to the Inbox page and select the location from the dropdown to see the actual comments.
- **Fix:** Link table rows or trend sparklines directly to `/dashboard/inbox?locationId=[id]` to provide smooth click-through navigation.
- **Suggested command:** `$impeccable connect table-to-inbox`

## Persona Red Flags

**Jordan (First-Timer):**
- Arrives after configuring their first location and is greeted by a complex, flat tabular list and empty lines. Needs a clear, simple onboarding nudge to scan their own QR code to test the flow.

**Riley (Stress Tester):**
- Notices the visual inconsistency between `/` (frosted glass), `/dashboard/onboarding` (glass card on sky), and `/dashboard` (white grid on gray). The sudden drop in design quality breaks the premium feeling.

**Casey (Mobile):**
- The sparklines in the KPI grid overflow or squeeze aggressively on narrow screens because they are hardcoded to a fixed width of `160` (KPI cards) or `60` (table cells).

**Morgan (Café operator):**
- Finds the daily trend chart lines difficult to distinguish without scanning a legend, particularly when viewing on an tablet under bright cafe lighting.

## Minor Observations

- The dashboard layout header (`border-b pb-5` layout) does not use `.glass-nav` or sticky blur properties, looking like a default navbar template.
- The `Sparkline` color parameter in "Total Feedback" uses a hardcoded OKLCH of `oklch(0.55 0.01 45)`, which renders as a dark brownish-orange line that doesn't correspond to any brand token.
- No visual loader indicator (e.g. mini-spinner) is shown when background data refreshes, making it hard to know if the real-time polling is functioning.

## Questions to Consider

- Should the sidebar navigation also support a translucent glass option when expanded, or should it remain solid to frame the content?
- How should the charts adapt to the dark mode tokens defined in `globals.css` if we fully apply the sky-glass theme?
- Can we merge the "Locations Breakdown" sparkline trend with a positive/negative ratio indicator to make the visual trends more actionable?
