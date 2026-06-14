# Build@Scale with AI — Framework Reference

> **Author:** Siva Kannathasan · siva.kann@i2ltech.com · May 2026
> **License:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — share and adapt freely; keep attribution: *"Build@Scale with AI by Siva Kannathasan"*

**How to use this file:** Copy to root of any new project repo. Replace every [PLACEHOLDER]. Follow Session 0 checklist before writing code. Adapt the patterns to your stack — the principles transfer; the specific tools don't.

**Every rule exists because skipping it created a real bug, doc gap, or lost context.** This is not theory. Each section captures a failure mode encountered in production development and the convention that prevents it.

---

## Table of Contents

1. Philosophy
2. Session 0 bootstrap checklist
3. CLAUDE.md template
4. Memory system setup
5. Documentation hierarchy
6. The 8-step chunk pipeline (Steps 0–7)
7. Impact analysis (blast-radius checklist)
8. Audit checklist (10 points)
9. Three-layer testing requirement
10. Plan tracking system
11. Branching strategy
12. Multi-developer workflow
13. Debug and observability
14. Release workflow
15. How to brief Claude
16. Locked decisions register
17. Common gotchas

---

## 1. Philosophy

The core loop:

```
impact → design → docs → build → audit → manual test → re-audit → wrap-up
```

Every chunk passes through every step. No skipping. The discipline is what compounds — one chunk built carelessly costs three later in debugging, rework, and lost trust in the test suite.

### Why each rule exists

| Rule | Failure mode it prevents |
|---|---|
| Design before code | Building the wrong thing, discovering integration conflicts mid-implementation |
| Docs before code | Future-you (or another developer) re-deriving the same design from code archaeology |
| Audit after code | Shipping bugs that a 10-minute checklist would catch |
| Three test layers | Believing "tests pass" means "feature works" when unit tests don't cover real flows |
| Plan-row tracking | Losing track of what's done, in progress, or blocked across multiple sessions |
| Locked decisions register | Re-arguing the same decision every 6 weeks because nobody wrote down the reasoning |
| Memory files | Repeating mistakes Claude already flagged in a past session |
| Single CLAUDE.md briefing | Each new session re-learning the project from scratch |
| Branch-per-chunk | Half-finished work blocking main, hard merges across overlapping changes |
| Multi-developer process | Shared process means any developer can pick up any chunk without a sync call |
| APP_DEBUG flag | Forgetting to remove debug code before release; debug features shipped to production |
| Runtime env loading | Building separate artifacts per environment; staging bundles with prod URLs |

The framework is heavy by design. Light frameworks optimize for the first week. Heavy frameworks optimize for month 6, when the code outweighs anyone's memory of why it was written that way.

---

## 2. Session 0 bootstrap checklist

**Starting fresh?** Complete this checklist before writing any feature code.

**Existing codebase?** Use the **Phase 0x — Retrofit** path in PLAYBOOK.md instead. It walks you through reverse-engineering docs from existing code, baselining the test suite, and agreeing on which conventions to adopt immediately vs gradually vs defer. Return here for individual checklist items as gaps are closed.

Before writing a single line of feature code, complete this checklist. Skipping any item creates rework later.

### Repository

- [ ] Create repo with appropriate visibility (private until launch is the default)
- [ ] `.gitignore` covering: `node_modules/`, build outputs, `.env`, `.env.local`, OS files, IDE files, coverage reports, log files
- [ ] Monorepo layout decided (single package vs workspaces). If multiple deployable units, use workspaces from day one — retrofitting is painful
- [ ] CI pipeline runs on every PR: typecheck, lint, unit tests, build verification
- [ ] Secrets guard in CI: a step that fails if any `.env` file or known secret pattern appears in the diff
- [ ] `docs/dev-setup-guide.md` written and verified by running it on a clean machine

### Claude Code memory setup

- [ ] Create `~/.claude/projects/<slug>/memory/MEMORY.md` index file
- [ ] Add starter memories (see Section 4)
- [ ] Commit nothing from `~/.claude/projects/` — memory is local per developer

### Core docs (Tier 1 — see Section 5)

- [ ] `CLAUDE.md` at repo root using the template in Section 3
- [ ] `docs/README.md` — index of all docs
- [ ] `docs/project-log.md` — the build plan as plan-rows
- [ ] `docs/dev-setup-guide.md` — technical setup
- [ ] `docs/architecture.md` — system overview
- [ ] `docs/positioning.md` (or product brief equivalent) — what this product is and is not

### Multi-developer setup

This section matters even if you're solo today — the conventions cost nothing to establish now and save a week when someone joins.

- [ ] `.env.example` committed and complete — every env var any developer needs, with a comment explaining purpose
- [ ] `docs/dev-setup-guide.md` verified by a second person running it from scratch (or, if solo, on a different machine / fresh OS install)
- [ ] Branch naming convention agreed: `feature/[ID]-[slug]`, `fix/[slug]`, `release/[component]-v[version]`
- [ ] PR review process documented: every PR must pass the 10-point audit + CI gates before merge
- [ ] Code ownership convention: plan-rows claim ownership via an `assigned:` field while in progress
- [ ] Shared memory rule: CLAUDE.md is the single source of truth for all developers AND all Claude sessions. Local memory files are not authoritative

### Test infrastructure (set up before writing any feature code)

The runner must be configured on Day 0. If it isn't, "run the tests" is a task that gets deferred until there are already 50 functions without coverage.

- [ ] **Unit test runner** configured: `vitest.config.ts` / `jest.config.js` with a smoke-test that passes (`pnpm test` or equivalent exits 0 with 0 failures)
- [ ] **E2E test runner** configured: `playwright.config.ts` / `cypress.config.ts` with `global-setup` stub that seeds/resets DB state. Suite runs with 0 tests and exits 0
- [ ] **CI pipeline** runs both `pnpm test` (unit) and `pnpm test:e2e` (E2E) on every PR — not just build verification
- [ ] `docs/testing-strategy.md` created with the pyramid structure and starting counts (0 per layer). Update counts each session — drift is invisible without a baseline
- [ ] `docs/manual-test.md` created with the section headers for your feature areas (empty is fine; the structure forces you to write scenarios as you build)
- [ ] Verify: run full test suite from scratch → 0 failures. Even with 0 tests, the runner must exit cleanly. A broken runner on Day 0 means 6 weeks of "I'll fix the test config later"

### Sanity check

- [ ] Clone the repo to a different directory, run the setup guide, confirm the project starts and tests pass
- [ ] Open the repo in a fresh editor window; the README should answer "what is this and how do I run it" in under a minute

---

## 3. CLAUDE.md template

CLAUDE.md is the shared briefing for every Claude Code session AND every human developer. It is the only doc that gets updated every session. Treat it like a changelog — append-only for session notes, with a small "current state" block at the top.

### Template

```markdown
# [PROJECT] — Claude Code workspace briefing

## What this project is

**[PROJECT]** — _"[one-sentence value prop]"_

[2–4 sentence description: the problem, the audience, the differentiator, the launch scope.]

**Launch niche:** [the narrow first market]

## Tech stack

- Backend: [e.g. Node.js + TypeScript, Express, tRPC]
- Frontend: [e.g. Next.js, Tailwind, React]
- Database: [e.g. Postgres + Prisma]
- Cache/Queues: [e.g. Redis + BullMQ]
- Storage: [e.g. S3-compatible object store with signed URLs]
- Worker: [if applicable — separate deploy from API]
- Desktop client: [if applicable — e.g. Electron]
- Mobile client: [if applicable]
- CI/CD: [e.g. GitHub Actions]

## Monorepo structure

apps/api         — backend
apps/web         — frontend
apps/worker      — background jobs (if separate)
apps/desktop     — desktop client (if applicable)
packages/db      — database schema + ORM client
packages/types   — shared types
packages/client-sdk — shared client logic (if multi-platform)
docs/            — all documentation
.github/workflows — CI

## Key business rules

[Bullet list of invariants that govern design decisions. Examples:]
- One [resource] can only belong to one [parent] ever
- [Validation] runs on every [event] before acceptance
- [Quota] is set at creation and can never be increased

## Current status

[A snapshot of where the project is right now. Update every session. Keep this section small — old session details go below in append-only notes.]

- **Phase 0 (Foundations):** ✅ Done — [summary]
- **Phase 1:** 🔧 In progress — [summary]
- **Next up:** [what the next chunk is]

## Debug flag

`APP_DEBUG` env var controls DevTools, log files, debug UI, test token bypass. Set in local `.env` only; absent in CI and prod. See `docs/debug-strategy.md`.

## Contributors

[List names or GitHub handles. Update when team changes.]

## Active chunk assignments

[Each entry: plan-row ID — assigned developer — branch name. Remove on merge.]

- A-05 — alice — feature/A-05-user-profile
- B-12 — bob — feature/B-12-upload-pipeline

## Session notes

[Append-only. Each session adds one block at the top. Never delete past notes.]

### YYYY-MM-DD — [session topic]

[What shipped, test count delta, decisions made, any followups.]

## Total tests

[Sum across all layers. Example for a full-stack project with desktop client:]

Total tests: NNN
- contracts/schema: NN
- API/backend: NN
- web/frontend: NN
- worker: NN
- E2E (web): NN
- E2E (desktop): NN
- desktop unit: NN
- client-sdk: NN

(Not every project has every layer. Track only the layers that apply.)

## Locked decisions

[See Section 15. Link to docs/locked-decisions.md if the list grows past ~10 entries.]

## Key docs

- `docs/project-log.md` — build plan + plan-rows
- `docs/architecture.md` — system overview
- `docs/positioning.md` — product framing
- `docs/dev-setup-guide.md` — technical setup
- `docs/onboarding.md` — process guide for new developers
- `docs/testing-strategy.md` — test counts + pyramid
- `docs/debug-strategy.md` — APP_DEBUG, logs, observability
- `docs/release-runbook.md` — release checklist
```

### Rules for keeping CLAUDE.md current

1. **After every session:** update Current status, Total tests, Next up. Append a session note.
2. **After every feature shipped:** the session note records date, what shipped, test count delta.
3. **After every locked decision:** add to locked decisions register.
4. **Never delete past session notes.** They are the project's memory; future debugging will need them.
5. **After every PR merge:** update "Active chunk assignments" — remove completed rows, add new ones for newly-started chunks.

CLAUDE.md is the briefing document. If a piece of information would help a new developer (or a fresh Claude session) understand the project today, it belongs here. If it's historical detail, it belongs in the session notes section.

---

## 4. Memory system setup

Claude Code's memory system persists context across sessions on a single machine. Memory files are local to each developer — don't try to share them across the team. Team-wide knowledge belongs in CLAUDE.md and docs/.

### Setup

Create `~/.claude/projects/<slug>/memory/MEMORY.md` as the index file. Each memory is a separate markdown file with frontmatter:

```markdown
---
slug: <unique-slug>
type: project | feedback | reference
created: YYYY-MM-DD
---

# Title

Body — bullet points or short paragraphs. Optimize for skimming.
```

### Memory types

- **project_*** — facts about the project state, infra, deferred items, gotchas
- **feedback_*** — patterns the user explicitly asked Claude to follow ("from now on, always X")
- **reference_*** — reusable patterns that transfer across projects

### Starter memories to seed

| Slug | Purpose |
|---|---|
| `project_state` | Current phase, active infrastructure, deferred security items, non-obvious gotchas |
| `feedback_impact_analysis` | The blast-radius checklist required before code changes |
| `feedback_e2e_testing` | Three-layer test requirement |
| `feedback_audit_checklist` | 10-point audit referenced in Section 7 |
| `feedback_chunk_pipeline` | The 7-step pipeline |
| `feedback_multi_dev` | Any team-specific patterns that emerge |
| `reference_project_framework` | Pointer to FRAMEWORK.md at repo root |

### MEMORY.md index format

```markdown
- [Project state](project_state.md) — current phase, active infra, deferred items
- [Impact analysis](feedback_impact_analysis.md) — blast-radius checklist before code
- [Three-layer testing](feedback_e2e_testing.md) — unit + E2E + manual every session
```

Update the index whenever you add a memory. Stale index = memories Claude never finds.

---

## 5. Documentation hierarchy

Three tiers, depth scales with project maturity.

### Tier 1 — Before code (Session 0)

| File | Purpose |
|---|---|
| `CLAUDE.md` | Shared briefing for developers and Claude sessions |
| `docs/README.md` | Doc index — one line per doc, grouped by category |
| `docs/project-log.md` | Build plan + plan-rows + status |
| `docs/dev-setup-guide.md` | Technical setup — clone to running app |
| `docs/architecture.md` | System overview and component relationships |
| `docs/positioning.md` | What the product is, what it isn't, launch niche |

### Tier 2 — Before feature (per chunk)

| File | Purpose |
|---|---|
| `docs/api-reference.md` | Endpoint inventory — grows as endpoints ship |
| `docs/testing-strategy.md` | Test counts + pyramid (updated per 4-case rule, see Section 8) |
| `docs/data-model.md` | Schema reference — updated per migration |
| `docs/manual-test.md` | Manual scenarios per feature |
| `docs/adr-NNN-*.md` | Architecture decision records for non-obvious choices |

### Tier 3 — Before launch

| File | Purpose |
|---|---|
| `docs/security-audit.md` | Findings + fixes |
| `docs/release-runbook.md` | Step-by-step release checklist (tag → CI → verify → rollback plan) |
| `docs/onboarding.md` | "Day one" process guide for new contributors. Covers: where decisions live, how to claim a chunk, how to start a Claude session, branch/PR conventions, who reviews what |
| `docs/locked-decisions.md` | Full register if it outgrows CLAUDE.md |
| `docs/secrets-strategy.md` | Secret inventory, precedence chain, where they live in prod |
| `docs/debug-strategy.md` | APP_DEBUG, logging, observability |
| `docs/beta-plan.md` | Go-to-market: infra checklist, launch sequence, success metrics |

Tier 1 must exist before code. Tier 2 grows with the codebase. Tier 3 must exist before any external user touches the product.

### Doc conventions

- Flat `docs/` directory. No subfolders until ~20 docs.
- Every doc listed in `docs/README.md`.
- Cross-link liberally — if Doc A references a decision, link to the doc that explains it.
- When a doc becomes stale/superseded: add a banner at the top saying what replaced it. Never silently delete.

---

## 6. The 8-step chunk pipeline

Every feature flows through these eight steps. A "chunk" is one plan-row — small enough to ship in one session, large enough to be meaningful.

```
impact → design → docs → build → audit → manual test → re-audit → wrap-up
```

> **The pipeline applies in ALL situations — including production firefighting.**
> The temptation to skip steps when the site is down is exactly when bugs get
> shipped to production. A 30-second audit would have caught the `history.length > 1`
> bug before it reached main. A 2-minute MFT check would have confirmed the back
> navigation fix worked. Skipping steps under pressure is how one broken thing
> becomes two broken things.
>
> **Hotfix mode (production outage):** Compress but never skip.
> - Step 0: 2 min — what files does this touch, what tests cover it?
> - Step 1: 1 min — confirm the fix approach before writing a line of code
> - Step 3: build + run the ONE test that covers this code path immediately
> - Step 4: run audit Points 4 (bugs), 8 (tests), 9 (test output) only
> - Step 7: update CLAUDE.md and push — don't leave the session without docs
>
> A hotfix that skips the audit and breaks a test is worse than a 10-minute delay.
> **The audit is faster than explaining the regression.**

### Step 0 — Impact assessment

Before anything else, run the impact analysis (Section 7 — the 7-question blast-radius checklist). State the findings explicitly in the conversation: "Data layer: migration needed. Shared contracts: `DiscoveryPhoto` type changes — 3 consumers. Adjacent risk: `advance()` in Slideshow.tsx touches 6 other features." If you can't answer a question, that's a design gap — resolve it here, not mid-implementation.

**This step cannot be skipped, abbreviated, or merged with Step 1.** The point is to understand the blast radius BEFORE proposing a design, so the design already accounts for the constraints.

### Step 1 — Design review

Present 2–3 design options with their trade-offs. Don't just describe one approach — show the alternatives and why each is worth considering. Cover: data model changes, API surface, UI surface, edge cases, rollback plan.

**Wait for explicit approval before proceeding to Step 2.** The user approves one option (or gives a new direction). This is the last cheap moment to change course.

**Multi-developer:** Post your design proposal in the PR description (open a draft PR) or in your team channel, not just to Claude. Other developers review the design before implementation starts. Catching design conflicts in writing is 10× cheaper than catching them in code review.

> **Solo:** skip team review — confirm the chosen option with yourself (or Claude) and move to Step 2. **Team:** post in PR description or channel and wait for sign-off before proceeding.

### Step 2 — Docs first

Update all three doc categories BEFORE writing any code:

1. **Plan-row** — mark it 🔧 in progress in `docs/project-log.md`. This claims the chunk.
2. **API/data docs** — API reference for new endpoints, data model for schema changes. Writing the contract before the implementation forces you to think through the interface.
3. **MFT scripts** — write the manual functional test scenarios in `docs/manual-test.md` NOW. You'll run these in Step 5. Writing them before coding forces you to think about the user-facing behaviour before getting lost in implementation details. Use the table format — one section per feature with `| # | Scenario | Steps | Expected | Status | Notes |` columns and `⬜/✅/❌` status values. See `/docsup` for the exact template.

If the design changes during implementation, update docs and code together in the same commit. Never let docs drift.

### Step 3 — Build

Implement. Write auto-tests (unit + E2E stubs) alongside the code, not afterward. A function without a test is unfinished work. Stay scoped to the plan-row — if you discover an adjacent issue, file it as a new plan-row, don't bundle it.

**At the end of Step 3:** run the full test suite (`pnpm test` or equivalent) and verify it passes. A green suite is the signal Step 3 is complete — not "the code compiles."

### Step 4 — Audit (first pass)

Run the 10-point audit checklist (Section 8) on your own code. **This is not optional** — it is the gate between "coded" and "done." Point 9 requires you to paste the actual test output, not assert that tests "should pass."

### Step 5 — Manual test

Run the MFT scripts you wrote in Step 2 against a real running instance. This means actually starting the app, executing each scenario step by step, and reporting the result (pass / fail / unexpected behaviour). Automated tests catch regressions; manual tests catch what the test author didn't think to write a test for.

**Claude runs the MFT scripts** — not describes them, not defers them to the user. Open the app, follow each script, report findings. If the app can't be started in this environment (CI, headless, sandbox, missing credentials), say so explicitly, list which scenarios need human verification, and mark them in `docs/manual-test.md` as `[ ] requires human — [reason]`.

### Step 6 — Re-audit

After fixing anything from Step 5, re-run the audit. Fixes often introduce new issues. **Only proceed to Step 7 when clean.** Re-run the test suite to confirm nothing regressed.

### Step 7 — Session wrap-up

Mark the plan-row ✅ done in `docs/project-log.md`. Update CLAUDE.md: current status, test count (run the suite, use the real number), append session note. Commit and push.

**Multi-developer:** Open the PR with the plan-row ID in the title (e.g. `[A-05] User profile endpoint`). Mark the plan-row ✅ done in the same PR. PR description includes: plan-row ID, design summary, testing notes, audit checklist results.

> **Solo:** commit directly to your feature branch. No PR required. Still commit + push — "pushed" is the only state that's safe if the machine fails. **Team:** open a PR, get at least one review against the 10-point audit before merging.

> **PR approval rule (non-negotiable):** Claude creates the PR and stops. Merging is the human's action — always. "Let's merge" means create the PR for review, not create-and-merge in one shot. Never call `gh pr merge` or equivalent without an explicit instruction to merge a PR that is already open and has been reviewed.

---

### End-of-session close checklist (mandatory — every session where code was written)

This runs at the END of every session, not just at chunk boundaries. Claude must complete all four steps before the session is considered closed.

1. **Run full test suite.** Paste the summary output (`X passed, Y failed`). Every failure is a blocker — fix it or explicitly document why it's a known skip (with a date and condition to un-skip). "Tests were passing before this session" is not a substitute for running them now.

2. **Run the 10-point audit** (Section 8) on everything changed this session. Read your own diff as if you're reviewing someone else's PR. Not a mental skim — each of the 10 points gets an explicit pass/fail. Fix anything that fails before signing off.

3. **Update CLAUDE.md.** Current status. Test count (verify it matches the actual test output from step 1). Append a session note at the top of the notes section. If you opened a new plan-row for an issue you found, add it to `docs/project-log.md`.

4. **Push the branch.** Never leave uncommitted changes overnight. Pushed = recoverable if the machine fails. Uncommitted local work = gone.

If the session is interrupted before the suite is green, leave a clear "STOPPED HERE — tests failing: [reason]" note in CLAUDE.md so the next session picks up from a known state.

---

## 7. Impact analysis (blast-radius checklist)

Run this **before writing any code** — fix, feature, or refactor. State the findings explicitly in the conversation before proceeding. The goal is to understand the full blast radius of a change before the first line of implementation is written.

### The 7 questions

| # | Question | Why it matters |
|---|---|---|
| 1 | **Data layer** — Does this require a schema migration? What tables/rows change? What's the rollback? | Migrations that fail mid-deploy are the hardest rollbacks. Two developers creating migrations simultaneously get sequence number conflicts. |
| 2 | **Shared contracts** — Does the change alter a shared interface, API shape, or type definition? List every consumer (other services, clients, test mocks) that must be updated in the same change. | A type that compiles correctly in isolation can still silently break a consumer that imports it. |
| 3 | **State flow** — What state (local, server, cache, queue) is read or written? Are there optimistic updates or cached values that could become stale? | Optimistic UI that disagrees with server state is the most confusing class of bug to debug. |
| 4 | **Cross-layer sync** — Which other components, services, or workers read the same data or share the same execution path? Do they all agree on the new shape? | The bug is often in the file you didn't think was affected. |
| 5 | **Test surface** — Which existing tests cover the changed code path? Run a search now. If a test exists, it must still pass after the change — update the test, don't delete it. | Tests that pass but don't cover the changed code are the worst kind of green. |
| 6 | **Adjacent code risk** — What else lives in the same file or execution path? What shared utilities does this touch? List them. | Fixing one thing and silently breaking an adjacent feature in the same function is the most common cause of regressions. |
| 7 | **Deployment/infra** — Is there a required deploy sequence (e.g. migrate-before-deploy)? New env vars to add to `.env.example` and CI? Infrastructure changes? | The second most common production incident cause after code bugs: deploy ordering. |

### Stack-specific extensions

The 7 questions above are stack-agnostic. Add rows to your CLAUDE.md's impact analysis for your specific stack. Examples:

**Electron / IPC-heavy apps:**
- IPC chain: does the change touch an IPC channel name or payload? Main handler + preload bridge + preload type + renderer call site must all be updated together.
- Platform sync: does this affect UI state mirrored in the OS (tray, dock badge, system tray menu)? The native side and renderer must stay in sync.

**tRPC / GraphQL:**
- Procedure shape: does the input schema or return type change? Every proxy (desktop IPC layer, web hook, test mock) that wraps the procedure needs updating — they each fail independently even though they're all connected.

**React / frontend:**
- useEffect dependencies: if you add state that a `useEffect` should react to, add it to the deps array. If you remove state from the array, verify the stale-closure case.

### Checklist format

Before every change, state this block:

```
Impact analysis for: <change description>
──────────────────────────────────────────
Data layer:        affected / not affected — <reason or "none">
Shared contracts:  affected / not affected — <what changes and which consumers>
State flow:        affected / not affected — <what state, what could de-sync>
Cross-layer sync:  affected / not affected — <which other layers read this data>
Test surface:      <list of tests to update, or "none">
Adjacent risk:     <list of other code in the same path, or "none">
Deployment/infra:  affected / not affected — <migration, env vars, infra>
```

If you can't answer a question, that is a design gap — resolve it before writing code. "I don't know" is a valid finding that triggers investigation, not a reason to skip the question.

---

## 8. Audit checklist (10 points)

Run after Step 3 (first pass) and again after Step 5 fixes (re-audit). Also run as part of the end-of-session close checklist after every session. Run before opening any PR.

1. **Code review** — read the diff end-to-end as if you didn't write it. Anything confusing? Anything you'd flag in someone else's PR?
2. **Docs updated** — every doc that references the changed surface is current. API ref, data model, manual test, architecture diagram if applicable.
3. **Edge cases** — null inputs, empty arrays, expired tokens, concurrent calls, network failure, partial writes. Each covered by a test or explicitly documented as "not in scope."
4. **Bugs** — read the code looking for off-by-one, race conditions, missing await, wrong comparison operator, swapped arguments.
5. **Vulnerabilities** — auth check present on every protected route, input validation on every accepted field, no secrets in logs, no SQL injection vector.
6. **Design alignment** — implementation matches the design from Step 1. If it diverged, design was updated to match (with reasoning).
7. **Dev instructions** — anything a future developer needs to know is in the code (inline comment) or the docs (linked from code). Not in your head.
8. **Test coverage** — three-layer rule satisfied (Section 9). Unit + E2E + manual scenarios all added or updated.
9. **Test execution** — run the full test suite now and paste the summary output (`X passed, Y failed`). Not "they should pass." Not "tests were green before this change." Run them, see the output, verify green. If any test fails: fix it before this point passes.
10. **Cross-doc sync** — test counts match across CLAUDE.md, `docs/testing-strategy.md`, and reality (the number from point 9 above). All shipped plan-rows marked ✅ done. `docs/testing-strategy.md` updated per the 4-case rule (see Section 9).

If any point fails, fix it before opening the PR. Reviewers should not be the ones catching these.

---

## 9. Three-layer testing requirement

Every feature ships with all three layers. Skipping one will eventually bite you.

### The three layers

**Unit tests** — fast, isolated, lots of them. Cover business logic, edge cases, error paths. Run on every commit.

**E2E tests** — browser-driven (or platform-driven for desktop/mobile). Cover real user flows end-to-end. Slower, fewer, exercise the full stack including database, queue workers, and external service mocks.

**Manual test scenarios** — written in `docs/manual-test.md` as a table per feature (`| # | Scenario | Steps | Expected | Status | Notes |`). Status uses `⬜` (pending), `✅` (passed), `❌` (failed). Run against a real running instance. Catches issues automated tests can't: visual regressions, timing, perceived performance, copy errors.

### testing-strategy.md self-maintenance rule

`docs/testing-strategy.md` must stay in sync with reality. Four cases trigger an update:

1. **New unit tests added** → update the layer's heading count + "Current count" line + pyramid figure
2. **New E2E spec file added** → update spec table + layer heading + Grand total + pyramid
3. **New test suite (e.g. adding a desktop layer)** → new layer section + add row to the pyramid
4. **Drift suspected** → quick count to verify. Stack-dependent. Examples:
   - Node + pnpm monorepo: `pnpm -r test 2>&1 | grep "Tests "`
   - Python: `pytest --collect-only -q | tail -1`
   - Go: `go test ./... -list ".*" | wc -l`

If counts in CLAUDE.md, `testing-strategy.md`, and reality disagree, fix it during the audit step — not later.

### Full test pyramid (use only layers that apply)

| Layer | Typical count | Purpose |
|---|---|---|
| Contracts / schema | 10–200 | Smart contracts, DB constraints, API contracts |
| API / backend | 100–500 | Endpoint handlers, business logic, middleware |
| Web / frontend | 50–300 | Component logic, hooks, client-side validation |
| Worker / background | 20–100 | Queue handlers, scheduled jobs, async pipelines |
| E2E (web) | 30–150 | User flows in a real browser |
| E2E (desktop) | 20–100 | User flows in a real packaged app |
| Desktop unit | 30–150 | Main process logic, IPC handlers, OS integration |
| client-sdk | 10–50 | Cross-platform shared logic |

Not every project has every layer. A pure API project has contract + API + maybe E2E. A web-only project has web + E2E web. Add layers as the product grows.

### E2E global setup rules

- **Seed data** — every E2E run starts with a known DB state. Implement a `global-setup` that resets/seeds in a single transaction.
- **Teardown** — cleanup runs even if tests fail. Use afterAll hooks or a `global-teardown`.
- **Run in any order** — no test depends on another test having run first. Each test sets up its own state.
- **Idempotent** — running the suite twice in a row produces the same result.
- **Parallelizable** — tests don't conflict on shared resources (file paths, DB rows, ports). Use unique IDs / random ports.

### Desktop E2E specifics

For Electron apps:

- Use the Playwright Electron launcher (`_electron.launch`) — drives the real packaged renderer.
- Spin up a mock API server on a test port so tests don't hit prod or require a local backend.
- Use an `APP_TEST_TOKEN` env var to bypass auth in test mode — the main process reads it and treats it as the stored session token. Far simpler than mocking the full auth flow. Guard with `if (!app.isPackaged)` so it never works in production builds.
- **Watch out:** VS Code sets `ELECTRON_RUN_AS_NODE=1` in the terminal environment. Spread via `...process.env` and Electron will silently run as Node.js — no `BrowserWindow`, no `app.whenReady()`, all Electron APIs `undefined`. Fix in fixture env: `ELECTRON_RUN_AS_NODE: undefined`.

---

## 10. Plan tracking system

`docs/project-log.md` holds the build plan as a flat list of plan-rows. Each row is a single chunk.

### Series naming

Pick a 1–2 letter prefix per domain area. Use sequential numbers within each prefix. Common conventions:

| Prefix | Domain |
|---|---|
| `A-` | Auth, accounts, identity |
| `B-` | Storage, blobs, file pipelines |
| `C-` | Content / data models |
| `D-` | Desktop / native client |
| `I-` | Infrastructure (CI, deploy, queue) |
| `J-` | UI / UX polish |
| `K-` | Security, hardening |
| `M-` | AI / ML features |
| `N-` | Notifications, email, push |
| `P-` | Payments, billing |
| `S-` | Safety, moderation, abuse |
| `T-` | Third-party integrations |
| `W-` | Worker / background jobs |

The exact letters don't matter — consistency does. Pick a scheme on day one and stick to it.

### Plan-row format

```
[ID] [status] | [assigned] | [title] | [optional notes / branch]
```

Example rows:

```
A-01 ✅ done    | alice | User signup flow        | Privy + DB upsert
A-05 🔧 in progress | bob | User profile endpoint | branch: feature/A-05-user-profile
A-06 ⏳ planned | —     | Profile avatar upload  | depends on B-12
B-12 🔧 in progress | alice | Upload pipeline     | branch: feature/B-12-upload
K-03 🛑 blocked | —     | Rate limit middleware  | waiting on infra decision
```

### Status values

- `⏳ planned` — designed but not started
- `🔧 in progress` — actively being built, has an assigned developer
- `✅ done` — shipped, merged, tests green
- `🛑 blocked` — depends on something else; note the blocker
- `❌ cancelled` — decided not to build; keep the row with reasoning

### Multi-developer

In-progress rows MUST have an `assigned:` field. This prevents two developers from claiming the same chunk. Claim a row by editing the plan-log and pushing in a single small commit before opening your feature branch.

If a row sits "in progress" for more than a session without commits, the assigned developer either updates the status or releases the row.

---

## 11. Branching strategy

Single rule: `main` is always shippable. Everything else lives on `dev` or feature branches. **Never push directly to `main` — always use a PR.**

### Branch naming

- Integration: `dev` — long-lived; accumulates features before each production release
- Feature: `feature/[ID]-[short-slug]` — e.g. `feature/A-05-user-profile`
- Fix: `fix/[short-slug]` — e.g. `fix/lightbox-overflow`

### Commit message convention (Conventional Commits)

```
type(scope): short description

Types:  feat | fix | chore | docs | refactor | test | perf
Scopes: web | api | worker | desktop | ci | db | contracts | deps
```

Examples: `feat(web): activate macOS download buttons` · `fix(api): guard self-like` · `chore(ci): fix release race condition`

### PR workflow — dev → main

Every production deploy goes through a PR. Never merge directly.

**Step 1 — push dev and get preview URL:**
```bash
git push origin dev    # Vercel auto-deploys preview
```

**Step 2 — open PR:**
```bash
gh pr create \
  --base main --head dev \
  --title "release: YYYY-MM-DD — [one-line summary]" \
  --body "$(cat <<'EOF'
## Changes
- feat(scope): ...
- fix(scope): ...

## Vercel preview
- [ ] Verified on preview URL: [paste URL]

## Tests
- [ ] Unit tests passing
- [ ] No TypeScript errors in source
EOF
)"
```

**Step 3 — verify on preview, then merge.** Production deploys automatically.

**PR title format:** `release: YYYY-MM-DD — [brief summary of batch]`

### Review process

Solo: open the PR, run the 10-point audit on yourself, verify on Vercel preview, merge.  
Team: at least one review from someone who didn't write it. Reviewer runs the 10-point audit.

### Rules

1. `main` is deployable at all times. **Never push directly to `main`.**
2. All feature work on `dev` or feature branches off `dev`.
3. PRs from `dev` → `main` are merge commits, not squash. The git history is useful.
4. Hotfixes: branch off `main`, fix, PR back to `main` AND back-merge to `dev`.
5. Tag desktop/component releases after merge: `git tag [component]-v[semver] && git push origin [tag]`
6. **`git push` must be a standalone command** — never chain it with `&&` after a commit.
   Permission rules (the `ask` list in settings.json) match against the full command string.
   `Bash(git push origin dev*)` only fires when the command *starts with* `git push origin dev`.
   A chained `git add ... && git commit ... && git push origin dev` starts with `git add` —
   the rule never matches and the push goes through without asking.
   Always issue push as its own separate command.

### Conflict resolution

If two PRs touch the same file, the second author rebases on top of the first after the first merges. Don't merge-resolve blindly.

If two PRs modify the same database migration, that's a process failure — migrations must be serialized. Only one open migration PR at a time.

---

## 12. Multi-developer workflow

> **Solo developer?** This entire section is optional — skip it. The framework works fine for a solo developer; the multi-developer conventions (chunk claiming, PR reviews, handoff notes, session ownership) exist to prevent two people from colliding. If it's just you, use what's useful and ignore the rest.

How multiple developers use this framework simultaneously without stepping on each other.

### Chunk ownership

Only one developer per plan-row at a time. Claim by editing the plan-row to `🔧 in progress | assigned: [name]` and pushing in a single commit before starting work. If you find yourself wanting to work on a row someone else has assigned, message them — don't duplicate the work.

### Session handoff

When you finish a session mid-chunk, update CLAUDE.md with a clear "stopped here" note in the session notes section:

```
### 2026-05-20 — A-05 user profile endpoint (in progress)

Stopped at: validation middleware written, missing the bio length check.
Next: add bio max-length (500 chars) test + implementation. Branch is pushed.
Open issue: are emojis in display name allowed? See A-05 design doc.
```

Next developer (or you after a break) starts by reading that note. No archaeology needed.

### Parallel work rules

- **Don't assign two chunks that touch the same file in parallel.** If you must, the second developer waits for the first to merge.
- **Database schema changes (migrations) are serialized.** Only one open migration PR at a time. Two migrations created simultaneously will have sequence number conflicts; one will need to be regenerated.
- **Shared types/SDK package changes require a heads-up to all active developers before merging.** A breaking change to `packages/types` cascades into every other in-progress chunk.

### PR-as-chunk

Each chunk = one PR. PR description template:

```markdown
## Plan-row
[A-05] User profile endpoint

## Design summary
[3–5 lines: what this builds and why]

## Testing
- Unit: N new tests in apps/api/src/routers/user.test.ts
- E2E: 2 new tests in apps/web/e2e/profile.spec.ts
- Manual: scenarios M-12 through M-15 in docs/manual-test.md

## Audit checklist
- [x] 1. Code review
- [x] 2. Docs updated
- [x] 3. Edge cases
- ...

## Plan-row marked done
Yes — commit XYZ updates docs/project-log.md
```

### Claude sessions per developer

Each developer runs their own Claude Code session on their own machine. CLAUDE.md is the shared briefing — both humans and Claude instances read it. **Don't rely on Claude "remembering" what another developer's session covered.** Local Claude memory files are per-machine; nothing crosses between developers.

If a session produced an important insight or decision, it goes into CLAUDE.md (session note or locked decisions register). Not "I'll tell them about it tomorrow."

### Memory files are per-developer

The `~/.claude/projects/<slug>/memory/` directory is local to each machine. Team-wide decisions go in CLAUDE.md and docs/, not in individual memory files. If a memory says X but CLAUDE.md says Y, CLAUDE.md wins. Update the memory.

### Onboarding a new developer

1. Send them the repo link.
2. Have them follow `docs/dev-setup-guide.md` (technical setup) end-to-end.
3. Have them read `docs/onboarding.md` (process guide).
4. Confirm they can run the full test suite green.
5. Assign them a small, low-risk plan-row to start (e.g. a UI polish task, not a schema change).
6. First PR: full audit checklist review, pairing on any audit points they're unsure about.

### CLAUDE.md merge conflicts

CLAUDE.md is append-only for session notes, so conflicts are rare. When they happen:

- **Session notes section** — keep both notes. Order chronologically.
- **Active chunk assignments** — keep both entries.
- **Current status** — pick the union or message each other to reconcile.
- **Total tests** — re-run the count and use the real number.

Never pick one version and discard the other. Both edits contained real information.

---

## 13. Debug and observability

The single most important pattern from production experience: gate every debug feature behind one flag. Never hard-code debug behaviour into the build.

### The APP_DEBUG pattern

Add an env var (e.g. `APP_DEBUG=true`) that gates all debug features behind a single flag.

**What to gate behind APP_DEBUG:**
- DevTools auto-open (Electron, browser)
- Log files written to disk
- Debug info bars / panels in UI
- Verbose console output
- Test token bypass (`APP_TEST_TOKEN`)
- Source map generation in renderer
- Extra IPC or network tracing

**Configuration:**
- In local `.env`: `APP_DEBUG=true`
- In `.env.example` (committed): `APP_DEBUG=` (blank — must be explicitly opted in)
- In CI prod build: no `.env` file → flag absent → all debug features off

**Benefit:** Never need to "remove debug code before release." Just don't include `.env` in the prod build. The same source tree produces a debug-instrumented dev build and a clean prod build, controlled by one variable.

```typescript
// Single point of truth — read after loadDotEnv()
const DEBUG = process.env.APP_DEBUG === "true";

// Used everywhere:
if (DEBUG) win.webContents.openDevTools({ mode: "detach" });
if (DEBUG) initLogFile();
if (DEBUG) showDebugBar();
```

### Runtime config loading (not build-time)

**Problem:** Build-time env var injection bakes values into the bundle at compile time. If you build with `localhost` URLs, you can't use the same artifact for prod.

**Solution:** Load `.env` at runtime (app startup), not at build time. The same packaged artifact works in dev (with `.env` present) and prod (no `.env`, falls back to bundled defaults).

**Pattern for Electron:**

```typescript
// Called at module load time — before app.whenReady()
function loadDotEnv(): void {
  const candidates: string[] = [];
  // Packaged: extraResources lands at resourcesPath (always defined, safe at module level)
  if (process.resourcesPath) candidates.push(join(process.resourcesPath, ".env"));
  // Dev: project root via __dirname relative path
  candidates.push(resolve(__dirname, "../../.env"));

  for (const envPath of candidates) {
    try {
      const lines = readFileSync(envPath, "utf8").split("\n");
      for (const line of lines) {
        const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].replace(/^["'](.*)["']$/, "$1");
        }
      }
      return; // stop at first readable file
    } catch { /* file absent — try next */ }
  }
}
loadDotEnv();
const DEBUG = process.env.APP_DEBUG === "true";
```

Two critical rules:
- **Never call `app.isPackaged` at module load time** — `app` is not yet initialized; the call throws. Use `process.resourcesPath` which is always defined.
- **Use `extraResources`, not `files`, for `.env`** (Electron) so the file lands at `process.resourcesPath` as a plain file, not inside the ASAR archive.

**Pattern for servers:** `dotenv.config()` called before any module that uses env vars. Top of `index.ts` (or equivalent entry point).

**CI guard:** If `electron-builder.yml` lists `.env` in `extraResources`, CI must `touch apps/desktop/.env` before the build step — the file is gitignored, so CI won't have it.

### Log file pattern (Electron / native apps)

**Problem:** `console.log` is invisible in packaged builds. Users can't share logs when reporting bugs.

**Solution:** Early-log buffer pattern — log() calls before `app.whenReady()` are buffered in memory and flushed when the log file opens.

```typescript
const _earlyLogs: string[] = [];
let _logPath: string | null = null;

function log(msg: string): void {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  if (_logPath) {
    try { appendFileSync(_logPath, line + "\n"); } catch { /* non-fatal */ }
  } else {
    _earlyLogs.push(line);
  }
}

function initLog(): void {
  if (!DEBUG) return; // Gate on APP_DEBUG
  // Try Desktop first (easy to find), fall through to userData, then temp
  const candidates = [
    join(app.getPath("desktop"), "app-debug.log"),
    join(app.getPath("userData"), "app-debug.log"),
    join(app.getPath("temp"), "app-debug.log"),
  ];
  for (const candidate of candidates) {
    try {
      const header = `\n=== APP ${new Date().toISOString()} | v${app.getVersion()} ===\n`;
      writeFileSync(candidate, header, { flag: "a" });
      _logPath = candidate;
      for (const line of _earlyLogs) appendFileSync(_logPath, line + "\n");
      _earlyLogs.length = 0;
      break; // first writable path wins
    } catch { /* try next */ }
  }
}
```

Call `initLog()` inside `app.whenReady()`, after `loadDotEnv()`. Anything logged before that buffers in memory and flushes when the file opens.

### IPC debug bridge (Electron)

Expose `isDebug()` via contextBridge so the renderer knows whether to show debug UI:

```typescript
// Main process
ipcMain.handle("config:debug", () => DEBUG);

// Preload
contextBridge.exposeInMainWorld("app", {
  isDebug: (): Promise<boolean> => ipcRenderer.invoke("config:debug"),
});

// Renderer (React)
const [showDebugBar, setShowDebugBar] = useState(false);
useEffect(() => {
  void window.app.isDebug().then(setShowDebugBar);
}, []);
// Render: {showDebugBar && <div className="debug-bar">api: {apiUrl}</div>}
```

The renderer doesn't see env vars directly — it learns from the main process via IPC.

### Test token bypass pattern

For E2E tests that need to skip the full auth flow:

```typescript
// Main process startup — ONLY in non-packaged builds
const testToken = process.env.APP_TEST_TOKEN;
if (testToken && !app.isPackaged) {
  storedToken = testToken;
}
```

For desktop E2E, spin up a mock API server on a test port and set `APP_API_URL` to point there. The app behaves identically to a real session but every request hits your mock. Unset `ELECTRON_RUN_AS_NODE` in the fixture env (VS Code sets it; it makes Electron run as plain Node.js with no Electron APIs).

---

## 14. Release workflow

Releases are tag-driven. The git tag triggers everything else.

### Tag-based releases

Every release is a git tag. Format: `[component]-v[semver]`

Examples:
- `desktop-v0.1.0`
- `api-v2.3.1`
- `web-v1.0.0`

Push the tag → CI builds → CI publishes → users get the update. No manual "upload binary" steps.

### GitHub Actions release workflow

Use a **4-job pipeline** to avoid the race condition where parallel platform builds compete to create the same GitHub Release:

```
create-release (draft) → build-windows + build-mac (parallel) → publish-release (latest)
```

**Why not `electron-builder --publish always`?** It uses the `package.json` version (e.g. `v0.1.0`) to name the release, ignoring the git tag (`desktop-v0.1.0`). Two parallel jobs both calling it race to create the same release — one wins, one silently fails to upload its assets. The 4-job pattern eliminates this entirely.

Skeleton (adapt per stack):

```yaml
on:
  push:
    tags:
      - 'desktop-v*'

permissions:
  contents: write

jobs:
  create-release:
    runs-on: ubuntu-latest
    outputs:
      tag: ${{ steps.tag.outputs.tag }}
    steps:
      - name: Extract tag
        id: tag
        run: echo "tag=${GITHUB_REF#refs/tags/}" >> $GITHUB_OUTPUT
      - name: Create draft release
        run: gh release create "${{ steps.tag.outputs.tag }}" --title "..." --draft
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}

  build-windows:
    needs: create-release
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      # ... install deps, build with dist:win (NOT release/--publish always)
      - name: Upload assets
        shell: bash
        run: gh release upload "${{ needs.create-release.outputs.tag }}" dist/app-setup.exe --clobber
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}

  build-mac:
    needs: create-release
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      # ... install deps, build with dist:mac (NOT release/--publish always)
      - name: Upload assets
        run: gh release upload "${{ needs.create-release.outputs.tag }}" dist/app-arm64.zip dist/app-x64.zip --clobber
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}

  publish-release:
    needs: [create-release, build-windows, build-mac]
    runs-on: ubuntu-latest
    steps:
      - name: Publish as latest
        run: gh release edit "${{ needs.create-release.outputs.tag }}" --draft=false --latest
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

Release stays draft until both platforms succeed — users never see a half-built release. Each platform = separate job (different runner, different signing, different artifact format).

### Stable artifact names

Use a fixed artifact name across versions (e.g. `app-setup.exe`, not `app-setup-0.1.0.exe`) so download URLs never change. The version is embedded in:
- The installer metadata
- `latest.yml` (electron-updater feed)
- The app's "About" panel

Why: a marketing page can link to a stable URL. An auto-updater can poll a stable URL. Versioned filenames mean updating links every release.

### Download proxy route

The web app exposes `/api/download/[platform]` that:
1. Reads the latest GitHub Release via the API (auth'd with `GITHUB_TOKEN`).
2. Finds the asset matching the platform.
3. 302-redirects to the asset CDN URL.

The file never passes through your server (saves bandwidth, avoids egress fees). Required: `GITHUB_TOKEN` env var (read-only PAT with Contents scope) and a published GitHub Release.

```typescript
// apps/web/src/app/api/download/[platform]/route.ts
export async function GET(_req, { params }) {
  const { platform } = await params;
  const assetName = ASSET_NAMES[platform]; // e.g. "app-setup.exe"
  const token = process.env.GITHUB_TOKEN;
  if (!token) return Response.json({ error: "Not configured" }, { status: 503 });

  const release = await fetch(
    `https://api.github.com/repos/${REPO}/releases/latest`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
  ).then(r => r.json());

  const asset = release.assets?.find(a => a.name === assetName);
  if (!asset) return Response.json({ error: "Asset not found" }, { status: 404 });

  // Follow redirect to CDN URL, 302 browser there — file never touches this server
  const resolved = await fetch(asset.url, {
    headers: { ...ghHeaders, Accept: "application/octet-stream" }
  });
  return Response.redirect(resolved.redirected ? resolved.url : asset.url, 302);
}
```

### Auto-updater (Electron)

`electron-updater` reads `latest.yml` from the GitHub Release.

- **Build-time:** `GH_TOKEN` with Contents Read+Write — `electron-builder --publish always` creates the release and uploads assets.
- **Runtime:** for private repos, the packaged app needs a read token to fetch updates. Public repos: no token needed.
- **Initialization:** wire inside `if (app.isPackaged)` guard, with a 10-second delayed first check so the main UX isn't blocked.

### Two PATs, different scopes

| Token | Where | Scope | Purpose |
|---|---|---|---|
| `GH_TOKEN` | CI build secret | Contents Read+Write | Creates releases, uploads assets |
| `GITHUB_TOKEN` | Server env var | Contents Read-only | Resolves download URLs in proxy route |

Naming them differently in your own configs helps avoid mixing them up.

### Prod-like test before beta

Before any external outreach:
1. Tag `v0.1.0` → CI publishes the release.
2. Set `GITHUB_TOKEN` (read-only PAT) in `apps/web/.env.local`.
3. Test the download button on a local web server pointing at the prod GitHub Release.
4. Install the artifact like an end user would.
5. Verify it connects to the prod API, signs in, runs the core flow.
6. Tag `v0.2.0` with a trivial change.
7. Verify the auto-updater picks it up within the polling interval.

If any step fails, fix it before sending the download link to anyone outside the team.

### Release runbook

Create `docs/release-runbook.md` with the exact steps for your project. Example skeleton:

```markdown
# Release runbook — [component]

## Pre-release
- [ ] All tests green on main
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] CLAUDE.md "Current status" reflects the release

## Tag and push
- [ ] git tag [component]-v[X.Y.Z]
- [ ] git push origin [component]-v[X.Y.Z]

## Verify CI
- [ ] All platform jobs green
- [ ] Release appears at github.com/[org]/[repo]/releases
- [ ] latest.yml present in release assets

## Post-release smoke test
- [ ] Download from /api/download/[platform] — installer launches
- [ ] Install on a clean machine — first-run flow works
- [ ] Sign in with prod account — core UX works
- [ ] Tag a patch release — auto-updater fires
```

---

## 15. How to brief Claude

Each session, paste a briefing block at the start. Claude needs context fast.

### Minimal briefing

```
Project: [PROJECT]
Current phase: [from CLAUDE.md]
Working on: [plan-row ID + title]
Branch: [branch name]

[Paste relevant CLAUDE.md sections: tech stack, current status, business rules]

Today's goal: [one sentence]

Active chunk assignments (do not propose changes to files owned by other chunks):
- A-05 — alice — feature/A-05-user-profile
- B-12 — bob — feature/B-12-upload-pipeline
```

The "active chunk assignments" line is critical in multi-developer projects — Claude proposing edits to files another developer owns creates merge conflicts.

### What NOT to do

- Don't assume Claude "remembers" yesterday's session. Each session starts fresh from the briefing.
- Don't paste 5,000 lines of code and ask "what do you think." Paste the specific file or function.
- Don't ask Claude to make decisions for you on locked items (Section 15). Tell Claude the decision.
- Don't ask Claude to skip the audit checklist "just this once."

### Anti-patterns to avoid

| Anti-pattern | Why it fails |
|---|---|
| "Just build it" without design review | Claude doesn't know which edge cases matter to you |
| Skipping the docs step | API reference and test plan go stale instantly |
| Marking a chunk done before Step 6 re-audit | Step 5 fixes always introduce something |
| Not updating CLAUDE.md at session end | Next session starts with wrong test counts and status |
| Assuming Claude knows what other devs are building | It doesn't — brief it on active chunk assignments |

---

## 16. Locked decisions register

Decisions that have been made and should not be re-litigated. Each entry: ID, decision, reasoning.

### Why this exists

Without it, the same decision gets re-argued every 6 weeks because nobody wrote down the reasoning. Lock the decision; future-you doesn't have to re-derive it.

### Format

```markdown
| ID | Decision | Reasoning |
|---|---|---|
| LD-01 | [what was decided] | [why] |
```

### Example entries

| ID | Decision | Reasoning |
|---|---|---|
| LD-01 | Duplicate detection: perceptual hash (8x8 average hash) | No external dep; BK-tree upgrade path documented |
| LD-02 | File upload limit: 50 MB | Covers large professional camera formats at max quality |
| LD-03 | Thumbnails: 300px WebP quality 80 | Consistent across all API surfaces; good enough for discovery |
| LD-04 | Worker process separate from API | Long-running queues incompatible with serverless platforms |
| LD-05 | Storage bucket fully private | All URLs presigned at query time; never stored signed URLs |
| LD-06 | APP_DEBUG env var gates all debug features | No code removal before release; delete .env instead |
| LD-07 | Runtime .env loading, not build-time | Same build artifact usable in dev and prod |

### When to add an entry

After any decision where you found yourself thinking "we already talked about this." Add it now so the conversation doesn't repeat.

### When to revisit

Write a new entry referencing the old one, with the new reasoning. Don't silently change existing entries — the history matters.

### Where it lives

Inline in CLAUDE.md while the list is small (≤10 entries). Spin out to `docs/locked-decisions.md` when it outgrows that.

---

## 17. Common gotchas

Pre-collected failure modes that recurred enough to be worth writing down.

### General

- **Test counts drift.** Run the count command before every PR. CLAUDE.md and reality disagreeing is a sign of audit-skipping.
- **"It works on my machine."** If a teammate can't reproduce a bug, it's an env config issue 80% of the time. Diff your `.env` against theirs.
- **Stale `.env.example`.** Every time you add a new env var to your local `.env`, add it to `.env.example` with a comment. Same commit.

### Electron / desktop

- **`app.isPackaged` cannot be called at module load time** — `app` is not initialized yet; the call crashes the process silently. Use `process.resourcesPath` (always available) to distinguish packaged vs dev.
- **`extraResources` files land at `process.resourcesPath`, not inside the ASAR.** Read them via `process.resourcesPath`, not via `__dirname`.
- **`ELECTRON_RUN_AS_NODE=1` in terminal env (VS Code sets it) makes Electron run as Node.js** — no `BrowserWindow`, no `app.whenReady()`, all Electron APIs `undefined`. Fix: set `ELECTRON_RUN_AS_NODE: undefined` in E2E fixture env.
- **`safeStorage` is only available after `app.whenReady()`.** Never call it at module load time.
- **Window hide-to-tray: destroying a `BrowserWindow` then calling `.show()` on it crashes.** Use `.hide()` + an `isQuitting` flag to keep the window alive; only let it close when actually quitting.
- **CSP `img-src` blocks remote assets** by default. Set `img-src 'self' data: blob: https:` (or scope to your domain) so signed URLs from object storage render.
- **`cursor: null` in tRPC inputs fails Zod validation** if the schema is `z.string().optional()`. Send `cursor ?? undefined` so JSON.stringify omits the key.
- **Auto-updater runs in packaged builds only.** Guard with `if (app.isPackaged)` so dev runs don't try to fetch updates.

### Web / Next.js

- **Server Components don't have access to client state.** If a component reads from `localStorage` or `window`, it must be a Client Component (`"use client"`).
- **`next/link` in jsdom tests fails to resolve** without an alias. Add `'next/link': require.resolve('next/link')` to your Vitest resolve config.
- **Hydration mismatches** from date formatting, random IDs, or feature flags. Either render the same value on server and client, or use a `useEffect` to populate after mount.
- **`CORS_ORIGIN` in the API must include the production web domain from day one.** A common mistake is setting `CORS_ORIGIN=http://localhost:3000` during development and forgetting to add the prod domain. Result: the entire prod site fails CORS checks on every API call. Minimum value: `https://yourdomain.com,http://localhost:3000`. Vercel preview URLs are handled by regex in code — they don't need to be in `CORS_ORIGIN`.
- **CSP `connect-src` blocks Vercel preview API calls.** The Vercel preview web app calls the Vercel preview API at `https://[project]-git-[branch]-[team].vercel.app`. This URL is not in your prod CSP (`connect-src https://api.yourapp.com`). Add `https://*.vercel.app` to `connect-src` so previews can talk to each other.
- **`toLocaleDateString()` with `undefined` locale** produces different output per OS/browser locale (DD/MM vs MM/DD ambiguity). Always pass `"en-US"` explicitly, or better: centralise in a `formatDate()` helper so it's consistent everywhere.

### Database / migrations

- **Migration files are append-only.** Never modify an existing migration — create a new one.
- **Two developers creating migrations simultaneously** will have sequence number conflicts; coordinate before creating.
- **`updateMany` is atomic; `findFirst` + `update` is not.** Use the atomic form when avoiding races.
- **Partial unique indexes need raw SQL** in some ORMs (e.g. Prisma doesn't support them natively).
- **Default values in migrations don't backfill existing rows.** Add a separate `UPDATE` statement if needed.
- **Run `migrate:prod` immediately after merging any PR that contains a schema change.** If you forget, every endpoint that touches the migrated table returns 500 on prod. If the auth middleware reads that table (which it does on every request), the entire site goes down for all users — not just the new feature.
- **Auth middleware reads the DB on every request.** Adding a new column to a table that auth middleware reads (e.g. `isAuthed` reading `AlphaInvite.status`) without migrating = 100% of authenticated users get 500. Treat auth-middleware table changes as the highest-urgency migrations.

### Redis

- **ioredis and @upstash/redis have different `set` TTL syntax.** ioredis uses positional args: `redis.set(key, value, "EX", seconds)`. Upstash REST client uses an options object: `redis.set(key, value, { ex: seconds })`. Mixing them compiles fine but the TTL is silently ignored — the key is set without expiry. This bypasses rate limits and cooldown logic. If your app switched from Upstash to ioredis, grep for `{ ex:` in all redis.set calls.

### CI / release

- **The CI runner has no `.env`** — anything that reads it must have defaults or the build step must `touch` an empty file.
- **GitHub Actions secrets aren't visible to PRs from forks.** Guard with `if: github.event.pull_request.head.repo.full_name == github.repository`.
- **Tags must be unique.** If you need to re-publish a release, you need a new tag.
- **Artifact glob must match the actual filename.** If `electron-builder.yml` uses `artifactName: app-setup.exe` (no version), don't glob `app-setup-*.exe` in the upload step.

### Multi-developer

- **Two developers modifying the same plan-row concurrently** creates merge conflicts in `project-log.md`. Claim rows before starting.
- **CLAUDE.md conflicts: keep both session notes** — don't pick one and discard the other.
- **Shared packages need rebuild after changes.** Add "after pulling: `pnpm build`" to `dev-setup-guide.md`.
- **A developer's local Claude memory is not authoritative.** If a memory says X but CLAUDE.md says Y, CLAUDE.md wins.

### Debug / observability

- **`console.log` is invisible in packaged builds** — use the early-log buffer pattern (Section 12).
- **Debug features not gated on APP_DEBUG.** Audit your debug surface before every release.
- **Logs containing secrets.** Never log full request bodies, full auth headers, or full database rows. Redact before logging.
- **IPC handlers not covered by unit tests.** Every `ipcMain.handle` registration should have a test that confirms the channel exists and returns the expected type for the happy path and the null/error case.

### Retrofitting an existing project

- **Docs that describe what the code *should* do, not what it *does*.** Write retrospective docs from code, not from intent. Disagreements between code and doc are decisions that need to be locked — don't silently fix the doc to match your preference.
- **"Our test count is about 50."** Count it. "About 50" drifts to 30 in three sessions. Baseline before adopting the framework; drift is invisible without a starting number.
- **Trying to retrofit everything at once.** Agree on immediate vs gradual vs deferred adoption (PLAYBOOK.md Phase 0x Step 6). Trying to add unit tests to all existing endpoints in one session stalls all new feature work.
- **Skipping archaeology.** Writing CLAUDE.md before understanding what you actually have produces docs that contradict the code. Run the archaeology prompt (Phase 0x Step 1) first; it surfaces the contradictions before you commit anything.
- **Implicit decisions with no owner.** Existing codebases have many "nobody remembers why" decisions — why Redis for sessions, why this particular DB schema shape, why the worker is separate. These are LD candidates. Write them down even if the reasoning is "we just did it that way" — that's still a decision that shouldn't be silently reversed.
- **Convention adoption during active sprints.** Don't adopt the 7-step pipeline mid-chunk. Finish the current chunk the old way, then start the next one clean. Mid-chunk process changes create mixed-methodology PRs that are hard to review.

---

**Last updated: 2026-05-28** — distilled from real production development experience. Every rule here exists because something broke when it wasn't followed.

*Starting fresh: copy FRAMEWORK.md + PLAYBOOK.md to repo root, run Session 0 checklist, follow 7-step pipeline. Existing codebase: start with Phase 0x — Retrofit in PLAYBOOK.md.*
