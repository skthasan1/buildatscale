# PLAYBOOK.md — Interactive Project Script

> **Author:** Siva Kannathasan · siva.kann@i2ltech.com · May 2026
> **License:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — share and adapt freely; keep this attribution.

**How to use:** This is a co-pilot script. Paste each phase's prompt into your Claude Code session when you reach that phase. Companion reference is `FRAMEWORK.md` (the "why" behind each step).

**Starting fresh?** Copy this file (and FRAMEWORK.md) to the root of your new project. Begin with Phase 0a.

**Existing codebase?** Go straight to **Phase 0x — Retrofit** (below the phases table). It replaces 0a–0e for projects that already have code.

---

## Phases at a glance

| Phase | What it produces | When to run |
|---|---|---|
| **0x — Retrofit** | Framework layered onto existing project | **Existing codebase — start here instead of 0a–0e** |
| 0a — Idea sharpening | One-paragraph pitch, audience, differentiator | Greenfield — first conversation |
| 0b — Tech stack | Locked stack choices with reasoning | Greenfield — after 0a |
| 0c — Repo bootstrap | Skeleton repo, CI, core docs | Greenfield — after 0b |
| 0d — Core documentation | Tier 1 docs filled in | Greenfield — after 0c |
| 0e — Multi-developer setup | Team conventions, onboarding doc | Any project, when second person joins |
| 1+ — Feature chunks | One plan-row at a time, through 7-step pipeline | Ongoing |

---

## Phase 0x — Retrofit (existing codebase)

**What it produces:** The full framework layered onto a codebase that already exists — CLAUDE.md, Tier 1 docs, test baseline, plan-rows for shipped + upcoming work, multi-developer conventions if needed.

**When to run:** You have working code but no framework docs, no plan-rows, no consistent conventions. Use this instead of 0a–0e. After 0x completes, continue with Phase 1+ for all new work.

**The retrofit mindset:** You're not rebuilding the project — you're writing down what it already is. Docs must match reality, not the other way around. Don't refactor the code to fit the docs; document what the code actually does, then plan improvements as new chunks.

### Step 1 — Archaeology (understand what exists)

```
I have an existing project I want to adopt the framework from FRAMEWORK.md for.
Help me understand what I have before we decide what to add.

Here's the current state:
[PASTE: README, package.json (or equivalent), directory tree (2 levels deep)]
[PASTE: any existing docs that describe the system]
[PASTE: CI config if it exists]

Please:
1. Summarize what this project is in one paragraph — the product, the audience, the tech stack.
2. List what framework components already exist (even partially): README, architecture doc, test suite, CI, .env.example, plan-tracking, branching conventions.
3. List what's missing vs the FRAMEWORK.md checklist (Section 2 + Section 5).
4. Flag anything that would conflict with the framework conventions — e.g. informal branching, no test suite, docs that contradict each other.
5. Rank the gaps: what missing piece creates the most day-to-day pain right now?

Don't write anything yet. Just diagnose.
```

### Step 2 — Write Tier 1 docs from code

Run this once per doc that's missing. Start with CLAUDE.md — everything else references it.

```
Based on the archaeology from Step 1, let's write [CLAUDE.md / docs/positioning.md / docs/architecture.md].

The project already exists, so these docs must match reality. Don't invent or idealize — describe what the code actually does.

[PASTE the relevant source material:
  - For CLAUDE.md: README, package.json, any existing docs
  - For positioning.md: README, landing page copy, any pitch/brief
  - For architecture.md: directory tree, key config files, deployment setup]

Please draft [the doc] using the template from FRAMEWORK.md Section [3/5]. Where you're unsure about intent, ask me rather than guessing. Flag any section where the existing code contradicts what the doc would say — those are decisions that need to be locked explicitly.

Show me the draft before writing it.
```

Repeat for each missing Tier 1 doc:
- `CLAUDE.md` — fill from existing README + stack knowledge
- `docs/architecture.md` — derive from code structure + deployment config
- `docs/positioning.md` — what this is/isn't, the target user, the differentiator
- `docs/dev-setup-guide.md` — verify it actually works on a clean machine
- `docs/README.md` — doc index (write last, once other docs exist)

### Step 3 — Baseline the test suite

```
Let's establish the current test baseline before adding new tests.

[PASTE: your test runner output, or run and paste:
  pnpm -r test 2>&1 | tail -30   (Node/pnpm)
  pytest --collect-only -q       (Python)
  go test ./... -list ".*"       (Go)]

Please:
1. Count tests per layer (unit, integration, E2E, etc.).
2. Identify which layers are missing entirely.
3. Flag any layer where coverage is so thin that regressions are likely on the next change.
4. Write the initial docs/testing-strategy.md using the pyramid from FRAMEWORK.md Section 8. Use the real counts — not aspirational.

After this, the "test count" baseline in CLAUDE.md reflects reality. New tests added in Phase 1+ are tracked against this baseline.
```

### Step 4 — Backfill plan-rows

```
Let's create docs/project-log.md with a realistic picture of where the project stands.

[PASTE: a list of the major features that already exist — even rough bullet points work]
[PASTE: a list of known upcoming work, bugs, or improvements]

Please:
1. Write plan-rows for already-shipped features, all marked ✅ done. Use the format from FRAMEWORK.md Section 9. The IDs don't need to be perfect — use sensible prefixes (A- auth, B- storage, C- content, etc.) and increment from 01.
2. Write plan-rows for upcoming work, marked ⏳ planned. Don't pad the list — only things you actually intend to build.
3. Note any known technical debt as plan-rows with a clear "why it matters" note (not every debt item needs a row — just the ones that are blocking or risky).
4. Flag any "in progress" work that doesn't have a clear owner or end state — that's a planning gap.

Show me the draft before writing it.
```

### Step 5 — Lock existing decisions

```
Let's seed the locked decisions register with decisions that have already been made (even if they were never written down).

Based on the project archaeology, here are decisions implied by the existing code:
[PASTE: tech stack choices, key architectural decisions you know about — e.g. "we use Redis not Postgres for sessions", "uploads go to S3 not local disk", "auth is JWT not session cookies"]

Please:
1. Formulate each as a locked decision entry (ID, decision, one-sentence reasoning).
2. Flag any decision where you're not sure WHY it was made — those are the risky ones. I'll fill in the reasoning.
3. Add LD-DEBUG (APP_DEBUG env var pattern) and LD-RUNTIME-ENV (runtime .env loading) if they're not already in the codebase — they're worth adopting from the start.

Add these to the Locked decisions section of CLAUDE.md.
```

### Step 6 — Adopt conventions going forward

```
The docs are now written. Let's agree on which framework conventions to adopt immediately vs defer.

Current gaps: [PASTE the gap list from Step 1]

Please propose a prioritised adoption order:
1. Which conventions to adopt RIGHT NOW — apply to all new work from this session forward (e.g. 7-step chunk pipeline, 10-point audit, plan-row claiming).
2. Which conventions to retrofit gradually — apply to existing areas only when touching them for another reason (e.g. adding missing unit tests for existing endpoints, writing manual-test scenarios for existing features).
3. Which conventions to defer — not worth the cost to retrofit (e.g. renaming old branches, reformatting git history).

For each "right now" convention: what's the first concrete action? (e.g. "Add the audit checklist comment block to the PR template")
```

### Step 7 — Multi-developer setup (if needed)

If multiple developers will use the framework, run Phase 0e after 0x completes.

### Exit criteria for 0x

- [ ] `CLAUDE.md` committed with real current status, tech stack, locked decisions
- [ ] `docs/architecture.md` committed (matches the actual code, not the ideal)
- [ ] `docs/dev-setup-guide.md` committed and verified on a clean machine
- [ ] `docs/project-log.md` committed with shipped features ✅ and upcoming work ⏳
- [ ] `docs/testing-strategy.md` committed with real test counts per layer
- [ ] Locked decisions register seeded with existing implicit decisions
- [ ] Conventions adoption order agreed (immediate vs gradual vs deferred)
- [ ] All new work from here uses the 7-step chunk pipeline

---

## Phase 0a — Idea sharpening

**What it produces:** A one-paragraph pitch, clearly named audience, the one-line differentiator.

**When to run:** First Claude session on the project. Before any tech decisions.

### Paste-into-Claude prompt

```
I'm starting a new project. Help me sharpen the idea before I write any code.

Rough description: [PASTE 3–5 sentences about what you want to build]

Please:
1. Reflect back what you understood the product to be in one paragraph.
2. Ask me 5 questions that would sharpen the positioning — audience, value prop, differentiator, what it's NOT, the narrow first market.
3. After my answers, propose a name for the project and a one-line tagline.
4. Write a draft positioning.md (~200 lines) covering: what this is, who it's for, what it's NOT, the four-layer value model (functional, emotional, social, identity), the narrow launch market.

Don't write code yet. Don't pick a tech stack yet.
```

### Exit criteria

- [ ] One-paragraph product description that someone outside your head would understand
- [ ] Named audience for v1 (specific — "indie photographers", not "creators")
- [ ] One-line differentiator vs the obvious alternatives
- [ ] `docs/positioning.md` draft committed

---

## Phase 0b — Tech stack

**What it produces:** Locked stack decisions with reasoning, written to docs.

**When to run:** After 0a is complete and `positioning.md` is committed.

### Paste-into-Claude prompt

```
Positioning is locked. Here's the doc:
[PASTE docs/positioning.md]

Help me pick the tech stack. Constraints I want to optimize for:
- [SOLO / SMALL TEAM / FLEXIBLE]
- [GREENFIELD / EXISTING INFRA]
- [WEB / DESKTOP / MOBILE / MULTI-PLATFORM]
- [BUDGET CONSTRAINTS if any]
- [DEPLOYMENT TARGETS if known]

Please:
1. Propose a stack for each layer (backend, frontend, DB, queue, storage, auth, payments if applicable).
2. For each choice, give one-sentence reasoning + one alternative considered + why rejected.
3. Flag any choice that's hard to change later (DB, payment processor) vs easy to change (UI framework).
4. Write a draft architecture.md (~150 lines) showing how the pieces fit together.

Treat each choice as locked once I agree. Future sessions should not re-litigate it.
```

### Exit criteria

- [ ] Each stack layer has an agreed choice with one-sentence reasoning
- [ ] `docs/architecture.md` draft committed
- [ ] Locked decisions register seeded in CLAUDE.md with LD-01 through LD-N

---

## Phase 0c — Repo bootstrap

**What it produces:** Skeleton repo, CI pipeline, Tier 1 docs, `.env.example`.

**When to run:** After 0b is complete.

### Paste-into-Claude prompt

```
Stack is locked. Here's positioning.md and architecture.md:
[PASTE both]

Help me bootstrap the repo. Please:
1. Propose the monorepo layout (workspaces, apps/, packages/, docs/).
2. Generate .gitignore covering: node_modules, build outputs, .env, .env.local, OS files, IDE files, logs, coverage.
3. Set up CI pipeline (GitHub Actions or equivalent) with: typecheck, lint, unit tests, build, secrets guard.
4. Write CLAUDE.md using the template from FRAMEWORK.md Section 3. Fill in everything we've decided so far.
5. Write docs/README.md as the doc index.
6. Set up multi-developer conventions: .env.example with every env var commented, branch naming convention written into docs, PR title format documented, chunk ownership rule in project-log.md.
7. Write docs/onboarding.md — the process guide for new developers: where decisions live (CLAUDE.md + docs/), how to claim a chunk, how to start a Claude Code session on this project, branch/PR conventions, how to handle CLAUDE.md merge conflicts.

Show me each file before writing it.
```

### Exit criteria

- [ ] Repo created and pushed
- [ ] `.gitignore` complete
- [ ] CI pipeline green on first push
- [ ] `CLAUDE.md` committed and filled in
- [ ] `docs/README.md` committed
- [ ] `.env.example` committed and complete
- [ ] `docs/onboarding.md` exists

---

## Phase 0d — Core documentation

**What it produces:** Tier 1 docs filled in beyond the README.

**When to run:** After 0c, before writing any feature code.

### Paste-into-Claude prompt

```
Repo is bootstrapped. Here's the state:
[PASTE CLAUDE.md]
[PASTE docs/README.md]

Help me fill in the Tier 1 docs before I write any feature code. Please draft:
1. docs/project-log.md — the build plan as plan-rows. Use the format from FRAMEWORK.md Section 9. Seed with: Phase 0 rows (already done), Phase 1 rows (first feature), and a few obvious Phase 2 rows.
2. docs/dev-setup-guide.md — technical setup from a clean machine. Every command. Test it mentally as if I just got a new laptop.
3. docs/testing-strategy.md — empty test pyramid seeded with the layers we'll use. Update the rule (4 cases trigger an update) at the top.
4. docs/manual-test.md — empty file with the format (numbered scenarios) explained at the top.

For each file, show me the draft and ask for corrections before committing.
```

### Exit criteria

- [ ] `docs/project-log.md` exists with seeded plan-rows
- [ ] `docs/dev-setup-guide.md` complete (verified by running it on a clean machine if possible)
- [ ] `docs/testing-strategy.md` skeleton committed
- [ ] `docs/manual-test.md` skeleton committed
- [ ] `docs/onboarding.md` complete (carried over from 0c, verified to cover all topics)

---

## Phase 0e — Multi-developer setup

**What it produces:** Team conventions documented; a second developer can be onboarded from docs alone.

**When to run:** When a second person joins, or proactively if you know the project will be multi-developer.

### Paste-into-Claude prompt

```
I'm setting up this project for multiple developers. Here's the current state:
[PASTE CLAUDE.md]

Please help me set up multi-developer conventions:
1. Review docs/dev-setup-guide.md — is it complete enough that a new developer could get running without asking me anything? Flag any gaps.
2. Review docs/project-log.md — do the plan-rows have enough detail for someone else to pick them up? Flag any rows that are too vague.
3. Create docs/onboarding.md (or update if it exists) — a "day one process guide" covering: where decisions live (CLAUDE.md + docs/), how to claim a plan-row, how to start a Claude Code session on this project, branch naming and PR conventions, who reviews what, how to handle merge conflicts on CLAUDE.md.
4. Add an "Active chunk assignments" section to CLAUDE.md so developers can see who's working on what.
5. Verify .env.example covers every env var any developer needs for local dev — flag any gaps.

Show me each deliverable before writing it.
```

### Exit criteria

- [ ] `docs/onboarding.md` exists and covers: chunk claiming, session starting, PR conventions, CLAUDE.md conflict resolution
- [ ] CLAUDE.md has "Active chunk assignments" section
- [ ] `.env.example` is complete (verified — all devs can run the app from it)
- [ ] A second developer can get the app running using only the docs (test if possible)

---

## Phase 1+ — Feature chunks

**What it produces:** One shipped plan-row per chunk, through the 7-step pipeline.

**When to run:** Ongoing, for every feature.

### Step 1 — Design

```
I'm starting a new chunk: [plan-row ID] [title].

Current project state:
[PASTE CLAUDE.md "Current status" + "Active chunk assignments" sections]

The plan-row says: [PASTE the row]

Please run impact analysis before I write code:
1. What code paths does this touch? (API endpoints, components, types, DB schema, IPC, queue jobs)
2. What type contracts could change? Anything cross-package?
3. What's the state/data flow? Optimistic UI vs server-authoritative?
4. What needs to stay in sync (e.g. tray + renderer in desktop, multiple tabs in web)?
5. What edge cases will the audit ask about?
6. What tests need to be added (unit, E2E, manual)?
7. What adjacent risks am I not seeing?

Then propose a design — data model changes, API surface, UI surface, rollback plan. Don't write code yet.
```

**Multi-developer note:** Post the design proposal as a PR description comment or in your team channel before Claude implements. Let other developers flag conflicts before code is written.

### Step 2 — Docs

```
Design is locked. Now update docs BEFORE writing code:
- docs/api-reference.md if endpoints change
- docs/data-model.md if schema changes
- docs/manual-test.md — add the scenarios that will exercise this feature

Show me each doc change as a diff.
```

### Step 3 — Build

```
Docs updated. Now implement [plan-row ID]. Stay scoped — if you find an adjacent issue, propose a new plan-row, don't bundle it.

Reference design: [PASTE design from Step 1]
```

### Step 4 — Audit

```
Implementation complete. Run the 10-point audit on the diff:
1. Code review — read end-to-end, flag anything confusing
2. Docs updated — every referenced doc is current
3. Edge cases — null inputs, empty arrays, races, network failures
4. Bugs — off-by-one, missing await, wrong comparisons
5. Vulnerabilities — auth checks, input validation, no secrets in logs
6. Design alignment — matches Step 1 design (or design was updated)
7. Dev instructions — anything future-me needs to know is in code or docs
8. Test coverage — unit + E2E + manual all updated
9. Test execution — tests actually run and pass locally
10. Cross-doc sync — CLAUDE.md test counts match, plan-row marked done, testing-strategy.md updated per the 4-case rule

For each point, say either ✅ pass or ❌ fail with what to fix.
```

### Step 5 — Manual test

(Human step — run the scenarios you wrote in Step 2 against a real running instance.)

### Step 6 — Re-audit

```
I ran the manual tests and found [N] issues. I fixed them in this diff:
[PASTE diff]

Re-run the 10-point audit on this fix. Did the fixes introduce any new issues?
```

### Step 7 — Next chunk

```
Chunk shipped. Please:
1. Update CLAUDE.md: current status, total tests (count: [N]), next up.
2. Add a session note dated today describing what shipped + test count delta.
3. Mark [plan-row ID] ✅ done in docs/project-log.md.
4. Remove [plan-row ID] from "Active chunk assignments" in CLAUDE.md.

Show me the diff before committing.
```

**Multi-developer:** Open the PR with the plan-row ID in the title (e.g. `[A-05] User profile endpoint`). Plan-row marked ✅ done in the same PR.

---

## Quick reference prompts

### "Audit my work"

```
Run the 10-point audit on this diff:
[PASTE diff]

Context: [plan-row ID] [title]. Design summary: [3 lines].

For each point, say ✅ pass or ❌ fail with what to fix.
```

### "I'm stuck on a bug"

```
I have a bug I can't pin down.

Symptom: [what you observe]
Expected: [what should happen]
Reproduction: [steps]
What I've tried: [debugging attempts]

Relevant code:
[PASTE 1–2 files, not the whole codebase]

Please:
1. List the top 3 hypotheses with rough probability.
2. For each, the specific check that would confirm or rule it out.
3. Don't propose fixes yet — diagnose first.
```

### "What should I work on next"

```
Here's the current state:
[PASTE CLAUDE.md "Current status" + "Active chunk assignments"]
[PASTE docs/project-log.md]

What should I tackle next? Consider:
- What's blocking other plan-rows
- What's short enough to ship in one session
- What's not currently assigned to another developer
- What has the highest impact-to-effort ratio
```

### "Refactor proposal"

```
I want to refactor [area]. Current state:
[PASTE relevant files]

Pain points: [list]

Please propose a refactor. Cover:
1. The smallest possible change that addresses the pain
2. What would break (callers, tests, docs)
3. Rollback plan if it goes wrong
4. Whether this should be one plan-row or split into several

Don't write code yet — propose first.
```

### "Onboarding a new developer"

```
A new developer is joining the project. Here's the current CLAUDE.md:
[PASTE]

Please help me onboard them:
1. Is docs/dev-setup-guide.md complete enough for them to get running alone?
2. Is docs/onboarding.md up to date?
3. What's a good first plan-row to assign them — small, self-contained, low risk of conflicts with active work?
4. What do they need to know about the current active chunks before starting?
```

### "Setting up debug configuration"

```
I want to add a debug configuration to this project following the APP_DEBUG pattern from FRAMEWORK.md.

Current project context: [PASTE relevant CLAUDE.md section]

Please implement:
1. APP_DEBUG env var in .env (local dev: true) and .env.example (blank)
2. A const DEBUG = process.env.APP_DEBUG === "true" loaded after env setup
3. Gate these on DEBUG: [LIST: DevTools auto-open, log file, debug bar in UI, verbose logging]
4. An IPC/API bridge so the renderer/client can read isDebug()
5. Update .env.example with a comment explaining the flag
6. Update the prod release checklist doc to say "delete .env — debug features off automatically"

Show me each piece before writing it.
```

### "Setting up the release workflow"

```
I want to set up a production release workflow for the [desktop/API/web] component.

Current setup: [describe CI, repo, artifact type]

Please implement:
1. GitHub Actions workflow triggered on [component]-v* tag push
2. Build step producing the artifact
3. Publish to GitHub Releases (--publish always or equivalent)
4. If desktop: stable artifact name, CI empty-.env guard (touch .env before build)
5. Download proxy route in the web app (/api/download/[platform]) using GITHUB_TOKEN
6. Auto-updater config if applicable
7. Prod-like test plan: what to verify before the first real release

Show me the workflow file before writing it.
```

### "Running a full release"

```
I'm about to publish [component] version [version].

Release checklist:
- Pre-release env check: [describe what needs to be verified]
- Version bump needed: [current → new]
- CI secrets in place: [list: GH_TOKEN, etc.]

Walk me through the release steps in order. Flag anything I haven't done yet. After each step, ask before proceeding to the next.
```

### "Test count drift"

```
CLAUDE.md says [N] total tests. I just ran the count and got [M].

Please:
1. Identify likely sources of drift (new tests not yet logged, deleted tests, skipped tests)
2. Reconcile the count layer by layer
3. Update CLAUDE.md and docs/testing-strategy.md with the corrected numbers
4. Add a session note explaining the discrepancy
```

### "Locked decision re-litigation"

```
Someone (possibly me) is questioning LD-[N]: [decision].

The reasoning was: [reasoning from register]

What's changed since the decision was made? Is the original reasoning still valid? If the decision should be revisited, what's the new entry that supersedes it?

Don't just agree to change it — push back if the original reasoning still holds.
```

---

## Signs the framework is working vs breaking down

### ✅ Healthy signs

- Plan-rows close in roughly one session each
- Test counts in CLAUDE.md match reality every PR
- New session starts with a 60-second briefing, not 30 minutes of context-rebuilding
- Audits catch issues before reviewers do
- Locked decisions are not re-argued
- Manual test scenarios catch issues automated tests missed
- PRs have plan-row IDs in titles
- No two developers claim the same plan-row
- New developer got running from docs alone — no Slack messages required
- CLAUDE.md updates land in the same PR as the feature

### 🚩 Warning signs

- Sessions starting with "wait, what did we decide about X?" — locked decisions register isn't being maintained
- "I'll add tests later" — they never get added later
- Audit checklist skipped because "this is a small change" — small changes are where bugs hide
- Manual test scenarios written but never run — automate or delete them
- CLAUDE.md "Current status" hasn't been updated in 3 sessions — drift compounding
- Plan-rows marked done that don't actually have tests
- Plan-rows marked in-progress with no assigned developer
- Two PRs modifying the same migration file
- CLAUDE.md test count hasn't been updated in 3+ sessions
- "Quick fix, no PR needed" — no such thing on `main`
- New developer asks questions answered in docs — docs aren't being kept current

### What to do when warning signs appear

Stop. Run the 10-point audit on the last 3 chunks. Update docs. Re-baseline test counts. Don't start a new chunk until the meta-state is clean. The framework only works when it's followed; drift compounds quickly.

---

**FRAMEWORK.md = the reference.** **PLAYBOOK.md = the script.** Use them together.
