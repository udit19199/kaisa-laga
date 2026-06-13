<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Kaisa Laga — Agent & Linear Workflow

Guide for AI agents and humans to keep [Linear](https://linear.app/udit19199/team/UDI/all) current as Kaisa Laga work progresses. The goal is **balanced tracking**: neither one mega-issue nor dozens of micro-issues.

**Linear project:** [Kaisa Laga](https://linear.app/udit19199/project/kaisa-laga-7bc2b6a39345)  
**Team:** Udit19199 (prefix `UDI-`)  
**Repo docs:** `docs/adr/` · `docs/REVISIT.md` · `README.md`

---

## Linear hierarchy (balanced)

### Project (Kaisa Laga) — durable context only

The [Kaisa Laga project](https://linear.app/udit19199/project/kaisa-laga-7bc2b6a39345) holds **stable product and architecture context**:

- Problem statement, solution overview, MVP stack
- ADR summary table (link to `docs/adr/`, do not paste full ADRs)
- Data model, tag taxonomy, alert engine rules, out-of-scope list
- Testing strategy summary, API contracts
- Link to `docs/REVISIT.md` for pre-production checklist

**Update the project description when architecture or product scope changes** — not on every PR. Implementation state lives in issues, not the project body.

### Parent issues (~5–8 per MVP phase) — milestones / epics

One parent issue per major milestone. Kaisa Laga MVP uses six:

| Milestone | Focus |
|-----------|-------|
| **M1 — Foundation** | Next.js scaffold, Supabase schema + RLS, Auth, env layout |
| **M2 — Customer Capture** | `/f/[locationId]`, hold-to-record, submission API |
| **M3 — AI Pipeline** | Inngest processing, Whisper + GPT, Zod validation |
| **M4 — Alerts** | Alert engine, Resend email delivery |
| **M5 — Operator Dashboard** | Onboarding, inbox, charts, settings |
| **M6 — Quality** | Vitest seams, E2E, integration tests |

Each parent issue includes:

- Brief scope statement (2–4 sentences)
- Acceptance criteria for the milestone
- Checklist of deliverables (checked off as sub-issues complete)
- Status reflects **epic completion** (Done only when all sub-issues are Done)

**Do not** use one parent for the entire MVP. **Do not** create a parent per tiny feature.

### Sub-issues — concrete deliverables

Sub-issues represent work that is:

- **1–3 days of focused effort**, OR
- A **distinct, testable seam** (API boundary, pure function, E2E flow)

Good examples:

- "Submission API + Inngest trigger"
- "Alert engine unit tests"
- "Dashboard sentiment chart"
- "Playwright E2E: capture flow with mocked MediaRecorder"

Bad examples:

- One sub-issue per file or component
- "Fix typo in README"
- Duplicating an entire ADR as an issue body

Nest sub-issues under their milestone parent (`parentId` in Linear). A milestone with only checklist items and no sub-issues is fine when work is already merged and no further deliverables remain.

### When to create vs update

| Situation | Action |
|-----------|--------|
| Extending scope within the same epic | Update the existing parent issue description/checklist |
| New deliverable within an epic | Create a sub-issue under that parent |
| New epic / MVP phase | Create a new parent issue under the project |
| Work merged | Check off boxes, move sub-issue → Done, roll up parent status |
| Architecture decision changes | Update project description + relevant ADR in `docs/adr/`; link from issue, don't duplicate |

---

## Sync rules for agents

Agents **must** keep Linear in sync with repo state. Treat stale issues as a bug.

### Before starting work

1. Read the [Kaisa Laga project](https://linear.app/udit19199/project/kaisa-laga-7bc2b6a39345) for context.
2. Find the relevant **parent milestone** and **sub-issue** (or create a sub-issue if the deliverable is new).
3. Move the sub-issue to **In Progress** when you begin implementation.
4. Prefer sub-issues labeled **`ready-for-agent`** for autonomous work.

### After completing work

1. Check off completed items in the sub-issue and parent checklists.
2. Move sub-issue status: Backlog → In Progress → Done (or In Review if human review is needed).
3. When all sub-issues under a parent are Done, mark the **parent Done**.
4. Link PRs and commits to the sub-issue (Linear branch naming: `udit19199/udi-XX-slug`).
5. Add a brief comment on the issue if the change set is non-obvious.

### UDI-10 and milestone structure

[UDI-10](https://linear.app/udit19199/issue/UDI-10/kaisa-laga-mvp-voice-cx-capture-platform) is the **MVP umbrella** — it tracks overall MVP acceptance criteria and links to M1–M6 sub-issues. **Do not** use UDI-10 as a catch-all for new work; add sub-issues under the appropriate milestone instead.

Remaining MVP work lives under **M6 — Quality** as sub-issues, not as unchecked boxes on UDI-10 alone.

### What stays where

| Location | Holds |
|----------|-------|
| **Project description** | Product context, ADR summary, out of scope, testing strategy |
| **Parent issues** | Milestone scope, acceptance criteria, rollup checklist |
| **Sub-issues** | Actionable deliverables, PR links, implementation checklists |
| **`docs/adr/`** | Full architecture decisions |
| **`docs/REVISIT.md`** | Pre-production checklist (post-MVP) |

---

## Issue templates

### Parent issue (milestone / epic)

```markdown
## Scope
[2–4 sentences: what this milestone delivers and why it matters]

## Acceptance criteria
- [ ] [Testable outcome 1]
- [ ] [Testable outcome 2]

## Deliverables
- [ ] [Sub-issue or completed item — link UDI-XX when exists]
- [ ] [Sub-issue or completed item]

## References
- ADRs: [001](docs/adr/001-application-architecture.md), …
- Parent umbrella: UDI-10 (if applicable)
```

### Sub-issue (deliverable)

```markdown
## Goal
[One sentence: what ships when this is Done]

## Tasks
- [ ] [Concrete step]
- [ ] [Concrete step]

## Definition of done
- [ ] [Testable verification — unit test, API response, E2E pass, etc.]
- [ ] PR linked; parent milestone checklist updated

## References
- ADR-XXX (link only, no full paste)
- Related files: `src/...`
```

Label **`ready-for-agent`** when the issue has clear scope, acceptance criteria, and no unresolved design decisions.

---

## Anti-patterns

| Anti-pattern | Why it's bad | Instead |
|--------------|--------------|---------|
| Single mega-issue with full PRD | Unmaintainable; hides progress | Project for context; M1–M6 parents + sub-issues for work |
| 50 micro-issues (one per component) | Overhead exceeds value | Combine into 1–3 day deliverables |
| Stale unchecked boxes after merge | Linear diverges from reality | Update issues in the same session as the PR |
| Duplicating ADR content in issues | Drift between docs and Linear | Link to `docs/adr/NNN-*.md` |
| Updating project on every PR | Noise; erodes stable context | Update project only on scope/architecture changes |
| Dumping all new work into UDI-10 | Recreates the mega-issue problem | Create/update sub-issues under M1–M6 |

---

## Linear MCP quick reference

When using the Linear MCP tools:

- **`list_issues`** — filter by `project: "Kaisa Laga"`, `parentId`, `label: "ready-for-agent"`
- **`get_issue`** — read full description, relations, branch name before starting
- **`save_issue`** — create with `team: "Udit19199"`, `project: "Kaisa Laga"`, `parentId` for sub-issues; update with `id: "UDI-XX"` to change status, description, labels

Status flow: **Backlog** → **Todo** → **In Progress** → **In Review** → **Done**
