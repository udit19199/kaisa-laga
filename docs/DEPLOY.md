# Deploy workflow

Kaisa Laga uses **Vercel Git integration**: every push to `main` builds and deploys to production automatically.

**Production URL:** https://kaisa-laga.vercel.app

## Day-to-day flow

```bash
# 1. Work locally
bun dev

# 2. Verify (optional but recommended)
bun test
bun run build

# 3. Ship
git add -A
git commit -m "Describe your change"
git push origin main
```

Within ~1–2 minutes, Vercel picks up the push, runs `bun install` + `bun run build`, and promotes the deployment to production.

Track progress: [Vercel → kaisa-laga → Deployments](https://vercel.com/udit19199/kaisa-laga)

## What runs automatically

| Trigger | What happens |
|---------|----------------|
| Push to `main` | Vercel **production** deploy |
| Push to other branch | Vercel **preview** deploy (unique URL) |
| Pull request | GitHub Actions **CI** (tests + build); Vercel preview if branch is pushed |

## What does *not* auto-deploy

| Item | Where it lives |
|------|----------------|
| Environment variables | [Vercel project settings](https://vercel.com/udit19199/kaisa-laga/settings/environment-variables) — change once, all future deploys pick them up. Sync from `.env.local` with `bun run vercel:env`. **Preview** vars on this project must be set in the dashboard (all Preview branches) if CLI sync skips them. |
| Database migrations | Use Drizzle for the primary schema baseline and forward migrations (`bun run db:generate` then `bun run db:migrate`); use `bun run db:baseline` only when an existing database already matches the baseline and just needs Drizzle history recorded |
| Clerk / Inngest dashboard config | Clerk + Inngest consoles |

Do **not** commit `.env.local`. Secrets stay in Vercel env vars.

## First-time / manual deploy

Only needed if Git integration is disconnected:

```bash
vercel link          # once per machine
vercel deploy --prod # emergency manual production deploy
```

Git is already connected: `vercel git connect` reports `udit19199/kaisa-laga` is linked.

## Optional: require CI before merge

In GitHub → **Settings → Branches** → branch protection on `main`:

- Require status check: `test-and-build` (from `.github/workflows/ci.yml`)

Vercel still deploys on push; this only blocks merging PRs that fail tests.

## Preview URLs

Open a PR or push a feature branch:

```bash
git checkout -b feature/my-change
git push -u origin feature/my-change
```

Vercel comments on the PR with a preview URL (if GitHub integration is enabled on the Vercel project).
