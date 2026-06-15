# Product

## Register

brand

## Canonical name

**Kaisa Laga** is the only product name. Do not use legacy names (Pulse Drop, Julienne, Oris) in user-facing copy, docs, or new code.

## One-line description

Kaisa Laga is a verified customer feedback and trust platform for restaurants and cafes in India.

## Users

- **Diners and guests** (primary homepage audience): people discovering where to eat, or reading what others felt after a real visit. Job: find trustworthy, visit-based reviews that sound like a friend recommending a place, not a rating widget.
- **Operators** (owners and managers): restaurants and cafes that onboard via a separate business path. Job: collect honest feedback from real visits, catch complaints early, recover privately, and build a verified public profile.
- **Capturing guests** (in-venue, `/f/[locationId]`): after a visit, often mobile, one-handed, little patience for forms. Job: answer *"Kaisa laga?"* with a quick voice or text note without creating an account. May optionally link the review to a **personal taste profile** after thank-you.
- **Signed-in diners** (optional): build a taste profile from onboarding + linked visit reviews; get **For you** venue matches on mobile before their next outing.

## Product Purpose

Kaisa Laga helps hospitality businesses collect honest feedback from verified visits, resolve issues in a private window, and publish trustworthy reviews for future guests.

**Business pain solved first:** understand what customers actually felt before it becomes public reputation damage.

**Long-term opportunity:** a public discovery layer powered by real visit-based reviews, not random internet noise.

**Review supply rule:** reviews exist only for businesses that have signed up and only from guests who visited and left feedback through Kaisa Laga. No scraped listings, no drive-by ratings.

## Homepage (`/`) — Search tab

**Audience:** Customers discovering verified reviews (public-facing discovery). Signed-in diners also reach **For you** (`/for-you`) for taste-matched venues.

**Hero promise:** Reviews from real visits, told like one food lover asking another *"Kaisa laga?"* — how was it?

**Taste matching:** Optional personal accounts. Reviews linked after capture deepen the profile; short onboarding bootstraps cold start. No match scores or star ratings — warm copy only (*"Feels like your kind of place"*).

**Tone:** Conversational, properly Indian (Hinglish-friendly where natural), warm, editorial. Not corporate survey language, not civic/government trust theatre, not luxury-hotel stiffness.

**Layout:** Mobile-first. Most diners and in-venue guests arrive on a phone; design narrow viewports first, then enhance for tablet/desktop. Operator dashboard (`/dashboard/*`) is the exception — desktop/web workflow.

**Page structure (direction):**

1. **Hero** — one clear promise (*Kaisa laga?* / reviews from real visits). No feature grids.
2. **Nav** — brand, search when we have scale, one quiet link to `/for-business`. No category chips, filters, or operator sign-up in the hero.
3. **Reviews** — place + what someone said + photo. Nothing else unless it helps a diner decide.
4. **Trust** — earned through visit-linked reviews and honest copy, not badge walls or metric blocks.

**Business conversion:** operators reach Kaisa Laga through `/for-business` only. Consumer discovery does not carry operator CTAs, dashboards metrics, or onboarding funnels.

## Show only what earns its place

Default rule: **if it does not help the person on this screen right now, remove it.** Do not copy app patterns (category rails, sentiment pills, visit counts, filter chips) because competitors have them.

### Diners (discovery `/`)

| Show | Hide |
|------|------|
| Place name (outlet the guest visited) | Star ratings (not in product) |
| What someone said (transcript / summary) | Sentiment labels (they can read the words) |
| Photo of the place or mood | Operator tags (`Food Quality`, `Wait Time`, …) |
| Search when enough venues exist | Visit / submission counts |
| | Category filters (cafe / cuisine) until we have real metadata |
| | "Verified" badge clutter if visit-linked is already the model |
| | Business sign-up CTAs, pricing, feature lists |

### Operators (`/for-business`, `/dashboard/*`)

| Show | Hide |
|------|------|
| Feedback inbox, alerts, themes, recovery actions | Consumer discovery chrome |
| Sentiment, tags, trends per outlet | Public-review marketing copy |
| QR setup, location management | Fake social proof, hero metrics |

### Capture (`/f/[locationId]`)

| Show | Hide |
|------|------|
| *Kaisa laga?* prompt, record control, thank-you | Policy essays, star widgets, account creation |
| Location name | Marketing nav, unrelated links |

## Business path (planned `/for-business`)

**Audience:** Restaurant and cafe operators evaluating Kaisa Laga.

**Job:** explain verified feedback collection, private recovery window, AI insights, and public trust profile; offer signup or contact for onboarding.

**Not:** a second homepage competing with consumer discovery; a clear side door for operators.

## Customer capture (`/f/[locationId]`)

**Scope:** in active design pass alongside marketing landing.

**Promise:** *"Kaisa laga?"* as a human invitation — speak or type what you felt after this visit.

**Success:** guest completes feedback in seconds; optional contact if they want follow-up.

## Operator experience (dashboard — later shell pass)

MVP inbox may list individual transcripts; **target experience** is overview-first: sentiment, recurring themes, and complaint alerts per outlet, with drill-down to specific voices when needed.

## Brand Personality

Human, conversational, Indian-rooted. Feels like the moment after a meal when someone asks *"Kaisa laga?"* — curious, direct, warm. Editorial restraint over SaaS scaffolding. Craft and intention over template polish.

**Lean into the name:** *Kaisa laga* means "how is it?" / "how was it?" in Hindi. The product is the question and the honest answer.

## Anti-references

- Generic SaaS landing templates: cream/sand body backgrounds, gradient text, eyebrow kickers on every section, hero-metric blocks, identical icon-card grids.
- Dark ops-room dashboards on marketing surfaces.
- Government/civic trust or classified-ad institutional aesthetics.
- Luxury-hotel stiffness and cold corporate hospitality tone.
- Review platforms that read customer-to-customer instead of person-to-person (food lover to food lover).
- Placeholder or copied brand names from design references (e.g. Mobbin templates).
- **Pattern tourism** — category chips, cuisine filters, sentiment badges, visit counts, or trust badge walls on consumer discovery because other apps do it.

## Design Principles

1. **Show only what earns its place** — Every element must help the diner, guest, or operator on that screen. No borrowed UI patterns (categories, filters, sentiment chips, counts) without a user job.
2. **Sound like a conversation** — Copy and layout should feel like recommending a place to a friend, not filing a complaint ticket.
3. **Verified before viral** — Trust comes from visit-linked feedback, not volume or stars alone.
4. **Frictionless at the edge** — Capture flow is the product promise; every extra tap is a failure.
5. **Indian, not generic global** — Language, rhythm, and cultural texture should feel at home in India without becoming caricature.
6. **Craft over template** — Put-together surfaces: photography, typography, spacing. Never cheap filler or "app store" density on consumer pages.
7. **One brand, multiple surfaces** — `/` and `/f/*` share conversational warmth; `/dashboard/*` serves workflow without becoming a different product aesthetic (dashboard shell pass comes after landing + capture).

## Visual anchor (recommendation)

Lead with **premium cafes and neighbourhood restaurants** for photography and copy rhythm: familiar QR behaviour, repeat visits, young mixed audience, strong fit for conversational reviews. Consumer discovery stays food-first — places to eat, not stays.

## Publication policy (product trust)

- ~7-day business preview/recovery window, then auto-publish after moderation checks.
- Businesses cannot delete negative reviews for payment or preference.
- Valid removal: spam, abuse, hate, threats, doxxing, fake visit signals, duplicates, irrelevant content.
- Resolved issues stay visible with business response / resolved status — more trustworthy than deletion.

## Accessibility & Inclusion

- Target **WCAG 2.1 AA** for text contrast, focus indicators, and form labels.
- Respect `prefers-reduced-motion` on all animations and transitions.
- Capture flow: large touch targets, clear recording state (not color-only), screen-reader labels on record control.

## Related docs

- **Design system & visual direction:** [`DESIGN.md`](DESIGN.md)
- **Architecture:** [`docs/adr/`](docs/adr/)
- **Agent workflow:** [`AGENTS.md`](AGENTS.md)
