# /scaffold — New Project Setup Guide

Guide the user through starting a brand-new project from zero: requirements gathering,
architecture decisions, repo scaffolding, and infrastructure verification.

**Use this when:** Starting a project from scratch. No existing code.
**Use `/foundation` instead when:** Adding infrastructure to an existing project.
**After `/scaffold` completes:** Run Phase 1+ with `/pipeline` for every feature.

---

## How to start

If no args are given, ask:
> "What are we building? Describe it in 2–3 sentences: the problem it solves, who uses it, and what platforms it runs on."

Then work through all 5 steps in order. Do not skip any step.

---

## Step 1 — Requirements gathering

Ask these questions. Collect answers before proceeding.

**1a — Product**
> "What does this product do? Who is the primary user? What is the one thing it does better than the alternatives?"

**1b — Platform scope**
> "Which platforms does this need to run on at launch? (web / mobile iOS / mobile Android / desktop Mac / desktop Windows / API only / CLI)"

**1c — Team**
> "Solo developer, or multiple people? If multiple: how many, and are they technical?"

**1d — Constraints**
> "Any hard constraints? Budget limits, specific infrastructure required (e.g. must use AWS), existing accounts (Stripe, Supabase, Vercel), timeline, or non-negotiables?"

**1e — First milestone**
> "What's the smallest version of this product that would prove the idea is worth pursuing? What would it NOT include?"

Confirm your understanding before proceeding to Step 2:
```
✅ Requirements captured:
   - Product: [one sentence]
   - Platforms: [list]
   - Team: [solo / N developers]
   - Constraints: [list or "none"]
   - MVP scope: [one sentence]
```

---

## Step 2 — Architecture decisions

Present 2–3 options for each layer. **Wait for explicit approval on every decision before proceeding.**
Record each locked decision in the project's CLAUDE.md (or a `docs/locked-decisions.md` file if started).

Work through these layers in order:

### 2a — Project structure
Present options relevant to the platform scope from Step 1.

For multi-platform projects (web + mobile, web + desktop, etc.):
```
Option A — Monorepo (pnpm workspaces / Turborepo)
  What: All apps + shared packages in one repo
  Trade-off: More setup upfront; simplifies sharing types, SDK, and CI
  Best for: Projects with shared business logic across platforms

Option B — Separate repos
  What: Each platform in its own repo; shared code published to npm
  Trade-off: Simpler per-repo; harder to keep shared code in sync
  Best for: Teams where platforms ship on completely different schedules

Option C — Monorepo with shared package boundary
  What: One repo; `packages/` for shared logic; `apps/` for each platform
  Trade-off: Best of A with clear boundaries; requires discipline on what goes in packages/
  Best for: [RECOMMENDED for full-stack projects with a client SDK]
```

### 2b — Frontend framework (if applicable)
```
Option A — Next.js (App Router)
  What: React-based, SSR + RSC, Vercel-optimized
  Trade-off: Heavier than pure SPA; excellent for SEO, auth, OG cards
  Best for: Web apps that need SEO and server-rendered data

Option B — Vite + React (SPA)
  What: Pure client-side React, no SSR
  Trade-off: Simpler dev setup; no SSR, needs a CDN or hosting for static files
  Best for: Dashboard-only apps, admin tools, authenticated-only apps

Option C — Expo (React Native)
  What: Cross-platform mobile/TV; same codebase for iOS + Android
  Trade-off: Less native feel, performance trade-offs on complex UIs
  Best for: Mobile-first apps where cross-platform reach matters more than native feel
```

### 2c — Backend / API
```
Option A — Express + tRPC
  What: Node.js HTTP server; tRPC for type-safe RPC between frontend and backend
  Trade-off: More setup; zero hand-written API types; excellent DX for full-stack TypeScript
  Best for: TypeScript monorepos where web/mobile share the API client

Option B — Next.js API Routes / Route Handlers
  What: Serverless functions co-located with frontend; no separate server deploy
  Trade-off: Cold starts, 10s timeout on Vercel; can't run long jobs or background workers
  Best for: Simple APIs with light logic; works best when there is no separate worker service

Option C — FastAPI / Django (Python)
  What: Python backend; async-first (FastAPI) or batteries-included (Django)
  Trade-off: Different language from frontend; excellent ecosystem for ML/data
  Best for: Teams with Python expertise or ML/data pipelines as a core feature
```

### 2d — Database
```
Option A — PostgreSQL via Supabase + Prisma
  What: Managed Postgres (Supabase), Prisma ORM for migrations and type-safe queries
  Trade-off: Supabase adds auth/realtime on top; Prisma migrations are developer-friendly
  Best for: General-purpose relational data; teams that want managed infra without vendor lock-in

Option B — PlanetScale / Neon (serverless Postgres)
  What: Serverless-compatible Postgres (branching, connection pooling built-in)
  Trade-off: More managed, slightly less control; great for Vercel deploy model
  Best for: Vercel-deployed apps where connection pooling would otherwise be manual

Option C — SQLite (local) / Turso (distributed)
  What: File-based DB (SQLite) or edge-replicated (Turso)
  Trade-off: Simplest setup; not suited for high-write multi-user apps
  Best for: Solo tools, desktop apps, or read-heavy apps with low write concurrency
```

### 2e — Auth
```
Option A — Privy (embedded wallets + social)
  What: Drop-in auth with email, social, and optional wallet; custodial NFT support
  Trade-off: Vendor dependency; easy for web3-adjacent products
  Best for: Products that may add web3 features later

Option B — Clerk / Auth0
  What: Hosted auth service; handles sessions, MFA, social login, JWT
  Trade-off: Vendor dependency; much less code to write than DIY
  Best for: Products where auth is not a differentiator

Option C — NextAuth / Lucia (self-hosted)
  What: Open-source auth; runs on your infrastructure; no vendor fees
  Trade-off: More code to maintain; you own the session storage and security
  Best for: Teams with security requirements that prohibit third-party auth
```

### 2f — Deployment
```
Option A — Vercel (web) + Railway (API + worker)
  What: Vercel for Next.js frontend; Railway for API process and background worker
  Trade-off: Two services to manage; excellent DX; Railway scales without Docker expertise
  Best for: Full-stack apps with a separate long-running API or worker

Option B — Vercel only (web + serverless API)
  What: Everything on Vercel; API as serverless functions inside Next.js
  Trade-off: 10s request timeout; no persistent background worker; simpler infra
  Best for: Web apps with light API logic and no background jobs

Option C — AWS / GCP / Azure
  What: Full cloud infrastructure; more control, more setup
  Trade-off: Significant DevOps overhead; needed for enterprise compliance requirements
  Best for: Enterprise products with specific infra requirements
```

After all decisions are approved:
```
✅ Architecture locked:
   - Structure: [option]
   - Frontend: [option]
   - Backend: [option]
   - Database: [option]
   - Auth: [option]
   - Deployment: [option]
   
   Recording in docs/locked-decisions.md...
```

---

## Step 3 — Scaffold

With requirements and architecture approved, scaffold the project now.

Build in this order (each item depends on the one before):

### 3a — Repository and workspace
- Create the directory structure (`apps/`, `packages/`, `docs/`, `.github/workflows/`)
- `pnpm-workspace.yaml` (or equivalent) defining all workspace packages
- Root `package.json` with monorepo scripts: `test`, `build`, `typecheck`, `lint`, `dev`
- Root `tsconfig.json` (base config) + per-package `tsconfig.json` extending it
- `.gitignore` covering: `node_modules/`, build outputs, `.env`, `.env.local`, OS files, IDE files, coverage, logs

### 3b — CI pipeline
Copy and adapt `shared/ci/github-actions.yml` to `.github/workflows/ci.yml`.
Customize the marked sections for this project's tech stack and test commands.

### 3c — Core docs
Write these files before any code:
- `CLAUDE.md` using the template from `shared/FRAMEWORK.md` Section 3
- `docs/README.md` — doc index (2–3 lines per doc, grouped by category)
- `docs/project-log.md` — seeded with Phase 0 plan-rows (all ✅ done) + first feature plan-rows (⏳ planned)
- `docs/architecture.md` — the stack decisions from Step 2 written as a system overview
- `docs/positioning.md` — what this is, who it's for, what it's NOT

### 3d — App skeletons
For each app in `apps/`, create the minimum to prove it runs:
- `package.json` with name and version
- Entry point (e.g. `src/index.ts` for API, `src/app/page.tsx` for Next.js)
- Dev start script that exits 0
- Build script that exits 0

Do NOT implement any features yet. Skeleton only.

### 3e — `.env.example`
Create `.env.example` at the root (and per-app if the stack requires it) with:
- Every env var any developer will need
- A comment explaining each one's purpose and where to get the value
- Blank values (not defaults) — developers fill them in from the comments

### 3f — Test infrastructure
Configure test runners before writing any feature code:
- Unit test runner (`vitest.config.ts` or equivalent) with one smoke-test that passes
- E2E test runner (`playwright.config.ts` or equivalent) with empty global-setup stub
- `docs/testing-strategy.md` with the pyramid structure and starting counts (0 per layer)
- `docs/manual-test.md` with the section header template

Confirm runners exit 0 with 0 tests before continuing.

Confirm when scaffolding is complete:
```
✅ Scaffold complete:
   - Directory structure created
   - CI pipeline configured
   - Core docs written: CLAUDE.md, architecture.md, positioning.md, project-log.md
   - App skeletons: [list]
   - .env.example complete with [N] vars
   - Test runners: unit ✅ | E2E ✅
```

---

## Step 4 — Foundation check

Run `/foundation` now to verify all infrastructure basics are in place.

`/foundation` runs a 9-point checklist. Every point must PASS before proceeding.
Fix any FAIL items before moving to Step 5.

---

## Step 5 — First commit

Stage and commit everything:
```bash
git init   # if not already a git repo
git add .
git commit -m "chore: initial scaffold

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

Then push:
```bash
git push origin main   # or the default branch
```

Confirm:
```
✅ /scaffold complete:
   - Architecture locked: [brief summary]
   - Scaffold committed: [commit hash]
   - Pushed: [branch]
   
Next: start feature work with /pipeline. For each feature, run the full
8-step pipeline (impact → design → docs → build → audit → mft → re-audit → wrap).

Read shared/FRAMEWORK.md Section 6 for the full pipeline reference.
Read shared/PLAYBOOK.md Phase 1+ for the paste-into-Claude prompts.
```
