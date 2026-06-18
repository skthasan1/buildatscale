# Changelog — Build@Scale with AI

All notable changes are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com).
Versions follow [Semantic Versioning](https://semver.org).

**Major** — pipeline structure changes (new/removed steps, renamed core concepts)
**Minor** — new features (skills, sections, CI templates, stack support)
**Patch** — fixes (typos, broken commands, inconsistencies)

---

## [2.5.3] — 2026-06-18

### Added
- **§19 Bug tracking** — new FRAMEWORK.md section with a lightweight in-repo bug log workflow:
  - `docs/bug-report.md` format: summary index table + individual entries (test ID, status,
    added by, resolved by, steps, expected/actual, comments). Entries are append-only — no editing
    another person's lines.
  - Three statuses: `open` (filed) → `fixed` (fix merged) → `closed` (re-run confirmed PASS).
    `Added by` and `Resolved by` can be the same person — the trail is what matters.
  - Single unified flow: anyone who runs a test and finds a FAIL always logs it first, then
    decides to fix now or hand off. No developer-vs-tester mode split.
  - Linking convention: bug entries reference scenario IDs (e.g. `BAO-04 #3`); plan rows
    reference bug IDs (e.g. `BUG-001`); commits reference both.
  - Anti-patterns documented: silent fix (no log), stale `fixed` (never re-run), unassigned
    `open` bugs older than 7 days.
- **`docs/bug-report.md` template** — shipped with the framework; projects create this file
  at setup. Includes: status key, workflow instructions for filing / fixing / closing, the index
  table, and a copy-paste entry template.
- **`/mft` skill updated** — FAIL path now always logs to `docs/bug-report.md` first.
  Step 5 "Next steps" simplified to a single flow (fix now vs hand off) — no developer/tester
  mode distinction.
- **`/audit` Point 10 extended** — bug log check added: open bugs without a plan row must be
  assigned or explicitly deferred; `fixed` bugs without a re-run block a release.
- **`/foundation` Point 8 updated** — `docs/bug-report.md` added to the Tier 1 docs baseline
  table (must exist, even if empty).

### Why this matters
> Previously, bugs found during manual testing were either fixed silently (no record) or filed
> in a developer's head (no handoff). The bug log creates a paper trail with three explicit
> states: who found it, who fixed it, and who verified the fix — without needing an external
> issue tracker, and without complex role separation.

---

## [2.5.2] — 2026-06-18

### Added
- **§18 Security hardening** — new FRAMEWORK.md section with four universal production security
  patterns distilled from real project security audits:
  - **§18.1 Timing-safe comparison** — use `timingSafeEqual` (not `===`) for all shared secret,
    webhook token, and API key comparisons. `===` leaks timing information that enables offline
    brute-force recovery.
  - **§18.2 Fail-loud env var pattern** — call `requireEnv()` at module load time (not inside
    handlers). Missing config crashes the process at startup instead of silently degrading and
    leaving guarded operations wide open.
  - **§18.3 Webhook double-guard** — validate shared secret (timing-safe) AND sender IP allowlist.
    Either alone is bypassable. For third-party webhooks (Stripe, GitHub, Slack): use the provider
    SDK's HMAC-SHA256 signature verification instead.
  - **§18.4 Long-lived credential storage** — encrypt OAuth refresh tokens and third-party API
    credentials at rest with AES-256-GCM before writing to DB. A DB breach should not immediately
    compromise all connected services.
  - **§18.5 Prompt injection guard (AI products)** — wrap all user-provided content in
    `<untrusted-data>` tags and harden the system prompt. Without explicit tagging, users can embed
    instructions in their content and the model may follow them.
- **Audit Point 5 extended** — `/audit` Point 5 (Vulnerabilities) now includes the five §18
  checklist items so every feature audit automatically checks the new patterns.

### Why this matters
> These four patterns (five for AI products) each protect against a different silent failure mode:
> timing oracle, env var wide-open gate, replay/IP attacks, plaintext DB breach, and prompt
> injection. The IP-allowlist trade-off for cloud webhooks (Vercel dynamic IPs, Stripe/GitHub IPs)
> is documented: for third-party webhooks, rely on their SDK signature verification and skip the
> IP check. The patterns are stack-agnostic and written in TypeScript for Node.js projects —
> the crypto primitives (`timingSafeEqual`, AES-256-GCM, `requireEnv`) have direct equivalents
> in every major server-side language.

---

## [2.5.1] — 2026-06-18

### Fixed
- **PowerShell / dual-tool permission rules** — On Windows, Claude Code uses the `PowerShell`
  tool for shell commands. A `Bash(...)` permission rule does NOT match a `PowerShell(...)` call,
  meaning `ask` list guards (e.g. `git push` prompts) were silently bypassed on Windows when only
  `Bash` variants were present. `shared/settings-template.json` now ships both `Bash(...)` and
  `PowerShell(...)` variants for every `allow` and `ask` entry. `.claude/settings.json` updated
  to match.
- **`/foundation` Point 8b** — New check "Settings dual-tool coverage" added to the `/foundation`
  skill. On Windows: verifies that `.claude/settings.json` has `PowerShell(...)` mirrors for every
  `ask` entry. Output format updated to include `Point 8b` row (N/A on macOS/Linux).
- **FRAMEWORK.md §11 rule 7** — Push-safety note extended to explain the `Bash`/`PowerShell` split
  and that `shared/settings-template.json` is the authoritative source for both variants.
- **README.md "Adapt to your tech stack"** — Added Windows/PowerShell callout with example showing
  that every `ask` rule needs both a `Bash(...)` and a `PowerShell(...)` entry.

### Why this matters
> The `ask` list is the safety net that forces a confirmation prompt before destructive operations
> (force push, tag delete, push to main). If a guard only has `Bash(git push origin main*)` and
> Claude runs the push via PowerShell on Windows, the rule never matches — the push goes through
> silently. This was a silent failure that only surfaces when you notice a push happened without
> a prompt.

---

## [2.5.0] — 2026-06-16

### Added
- **`/scaffold` skill** — 5-step new-project guide for greenfield projects:
  (1) requirements gathering (product, platforms, team, constraints, MVP scope);
  (2) architecture decisions (monorepo, frontend, backend, database, auth, deployment —
  2–3 options each, wait for approval, record in locked-decisions); (3) repo scaffolding
  (directory structure, CI, core docs, app skeletons, `.env.example`, test runners);
  (4) `/foundation` check; (5) first commit. Replaces the manual Phase 0a–0c PLAYBOOK
  path for new projects.
- **`/foundation` skill** — 9-point reactive infrastructure checklist for sessions
  where you set up or change infrastructure (not feature code): (1) `.env.example`
  complete; (2) `.gitignore` covers all categories; (3) secrets guard in CI;
  (4) CI pipeline configured; (5) dev quickstart complete; (6) test baseline exits 0;
  (7) package/monorepo wiring; (8) Tier 1 docs baseline; (9) pushed. Output mirrors
  `/audit` format (PASS/FAIL per point). Replaces `/audit` + `/mft` for infrastructure
  sessions. Also called automatically by `/scaffold` step 4.

### Changed
- **README.md** — Workflow map updated to show three session types and which skills each
  uses. Commands table updated to include `/scaffold` and `/foundation`. "For Savvy
  Developers" commands table updated to show 11 skills.
- **FRAMEWORK.md** — §2 Session 0 checklist references `/scaffold` for greenfield;
  §6 pipeline intro references `/foundation` for infrastructure sessions; new §18
  "Session type map" documents the three session workflows.
- **PLAYBOOK.md** — Phase 0c prompt notes that `/scaffold` handles the same work
  interactively; Phase 0x Step 1 tip added for `/foundation` on infra gaps.

### Why this matters
> When setting up a new project, the old PLAYBOOK.md path (0a → 0b → 0c → 0d) required
> the user to manually drive 4 separate prompt sessions. `/scaffold` collapses all of
> that into one guided conversation that covers requirements, architecture decisions,
> and repo setup without switching docs. `/foundation` fills the gap identified when
> adding CI or infra to an existing project — the old `/audit` was too feature-centric
> (it expected code to review), and `/mft` assumed features to test. Now every session
> type has a clear closing skill: feature work → `/audit` + `/mft`; infra work →
> `/foundation`; both followed by `/wrap`.

---

## [2.4.4] — 2026-06-14

### Fixed
- **Post-upgrade audit required** — `/upgrade` now explicitly prompts the user to
  run `/audit` after every framework upgrade. Upgrading applies new rules to skill
  files but cannot check whether the existing project already meets them — only
  an audit can do that. `README.md` Upgrading section updated to show the three-step
  sequence: `git -C shared pull` → `/upgrade` → `/audit`.

---

## [2.4.3] — 2026-06-14

### Fixed
- **Branching strategy clarified** — `FRAMEWORK.md` §11, `commands/wrap.md`, and
  `docs/branching-strategy.md` now all agree: PRs use **merge commits** (not squash),
  `dev` is never deleted after merge, and after every PR merge the next step is
  `git checkout dev && git pull origin dev`. Squash merge was removed as the default
  because it deletes the dev branch and loses commit history.

---

## [2.4.2] — 2026-06-14

### Fixed
- **PR approval rule added** — `FRAMEWORK.md` Step 7 and `commands/wrap.md` Step 5
  now include an explicit non-negotiable rule: Claude creates the PR and stops;
  merging is always the human's action. "Let's merge" means create the PR for
  review, not create-and-merge in one shot.

---

## [2.4.1] — 2026-06-09

### Fixed
- **MFT scenario format standardised** — `docsup.md` now prescribes the compact table
  format (`| # | Scenario | Steps | Expected | Status | Notes |`) with `⬜/✅/❌`
  status values and a **Date tested** header per section. The old verbose multi-line
  prose format (`**Precondition:**`, `**Steps:**`, `**Pass/fail:** [ ]`) is replaced.
  `FRAMEWORK.md` Step 2 and the "Manual test scenarios" definition in Section 9 both
  reference the table format and link to `/docsup` for the template.

---

## [2.4.0] — 2026-06-05

### Added
- **Auto-build after gap analysis** in `README.md` initiate prompt and `PLAYBOOK.md`
  Phase 0x. The setup prompt now instructs Claude to run a full gap analysis after
  installing the framework and build everything missing (CLAUDE.md, Tier 1 docs, test
  baseline, plan-rows) in the same session — without waiting for per-step prompting.
- **Auto-build mode note** in Phase 0x — explicit instruction that Claude should
  proceed through Steps 2–6 automatically after archaeology, pausing only when a
  decision is genuinely ambiguous (e.g. intended audience can't be inferred from code).
- **Phase 0x Step 1 close instruction** — prompt now ends with "proceed immediately
  through Steps 2–6 — build every missing component without waiting for separate prompts."

### Why this matters
> When applied to an existing project, the old initiate prompt stopped at "Confirm
> when done" — leaving the user to manually drive through each PLAYBOOK step. Many
> docs were missing and never got built. The new prompt closes the loop automatically:
> install → gap analysis → build everything → ready for Phase 1+.

---

## [2.3.2] — 2026-06-04

### Added
- **§17 gotchas** (FRAMEWORK.md): `CORS_ORIGIN` must include the production domain
  (not just localhost); `AlphaInvite` / auth middleware migration risk (site-wide 500
  if the migrated table is read before migration runs on prod — run `migrate:prod`
  immediately after merge); `pnpm/action-setup` version conflict (`version:` key in CI
  conflicts with `packageManager` in package.json).

---

## [2.3.1] — 2026-06-03

### Added
- **§17 gotchas** (FRAMEWORK.md): CSP `connect-src` must include `https://*.vercel.app`
  for Vercel preview deployments; ioredis `redis.set(key, val, "EX", seconds)` syntax
  vs Upstash `{ ex: seconds }` (silently ignored); global date format helpers instead
  of `toLocaleDateString()`.

---

## [2.3.0] — 2026-06-02

### Added
- **PR-only workflow for dev→main** (§11, §14): never push directly to `main`; always
  open a PR so there's a Vercel preview URL to verify before going live. PR title format
  documented: `release: YYYY-MM-DD — [summary]`.
- **4-job CI pipeline for desktop releases** (§14): `create-release (draft)` →
  `build-windows + build-mac (parallel)` → `publish-release (latest)`. Eliminates the
  race condition where two parallel jobs compete to create the same GitHub Release.
- **`git push` standalone rule** (§11): `git push origin <branch>` must be issued as a
  standalone command, never chained with `&&` after a commit. Ask rules only fire when
  the command starts with `git push` — chaining bypasses the prompt.
- **Post-merge migration step** (§11 branching): if a PR contains a Prisma migration,
  run `migrate:prod` immediately after merge. Deferring it causes site-wide 500s if any
  auth middleware reads the migrated table.

---

## [2.2.0] — 2026-06-01

### Added
- **Hotfix mode specification** in FRAMEWORK.md pipeline section. Documents that the
  pipeline must never be skipped — including during production firefighting. Defines
  a compressed hotfix checklist: Step 0 (2 min impact), Step 1 (1 min approach
  confirm), Step 3 (build + run targeted test), Step 4 abbreviated (Points 4/8/9
  only), Step 7 (update docs). Earned from a real incident where skipping the audit
  shipped a broken E2E test to production.
- **`/pipeline` skill reinforcement**: no-skip guarantee added at the top of the skill
  file so it's the first thing read before any pipeline run.

### Changed
- FRAMEWORK.md pipeline intro now includes the hotfix mode callout as a prominent
  blockquote before Step 0, not buried in session wrap-up.

### Why this matters
> "The audit is faster than explaining the regression." — Skipping audit under
> pressure is how one broken thing becomes two. Compress steps, never omit them.

---

---

## [2.1.0] — 2026-05-28

### Added
- **Stack detection in `/pipeline`** — auto-detects Next.js, Expo/React Native, Electron,
  Python, Rust, Go, Blockchain from project files before Step 0. Confirms `TEST_CMD`
  once at project start; all steps use it from that point.
- **`TEST_CMD` variable** in `/build`, `/audit`, `/wrap` — no longer hardcoded to
  `pnpm test`. Detected by `/pipeline`; examples for monorepo (`pnpm -r test`),
  Python (`pytest`), Rust (`cargo test`), Go (`go test ./...`) shown in each skill.
- **`ci/github-actions.yml`** — starter CI pipeline. Typecheck + lint + unit tests +
  build verification + secrets guard, all in one file. E2E job included as commented
  template. Comments show npm/yarn/Python/Rust/Go equivalents for each step.
- **Solo/team callouts** in FRAMEWORK.md §6 Steps 1, 7 and §12 — `> Solo: skip / Team: do X`
  pattern so solo developers can ignore multi-dev overhead without confusion.
- **`/upgrade` skill** — detects installed version from `.claude/buildatscale-version`,
  shows CHANGELOG delta since that version, auto-updates skill files, flags breaking changes.
- **VERSION file** — single-line version string. Copied to `.claude/buildatscale-version`
  on install so upgrades know the starting point.

### Changed
- **`/impact` stack-specific section** — IPC chain, tRPC, React useEffect, mobile native
  bridge, and blockchain ABI checks are now grouped by platform and explicitly opt-in
  ("only answer these if applicable"). Web adopters no longer wade through Electron guidance.
- **FRAMEWORK.md §6 Step 5 (Manual test)** — headless/CI/sandbox context acknowledged.
  Claude now marks unchecked scenarios as `[ ] requires human — [reason]` rather than
  silently skipping.

### Fixed
- PLAYBOOK.md: 4 remaining "7-step pipeline" references updated to "8-step pipeline".

---

## [2.0.0] — 2026-05-28

### Added
- **8-step pipeline** — Step 0 (Impact assessment) extracted from Step 1 and made a
  standalone gate. Full pipeline: impact → design → docs → build → audit → mft → re-audit → wrap.
- **8 Claude Code skills** installed to `.claude/commands/`:
  - `/pipeline` — guided walkthrough of all 8 steps with gates between each
  - `/impact` — 7-question blast-radius analysis before any code
  - `/design` — present 2–3 options with trade-offs, wait for explicit approval
  - `/docsup` — plan-row + API ref + MFT scripts before coding
  - `/build` — implement + auto-tests alongside + run suite at end
  - `/audit` — 10-point checklist; Point 9 requires pasting actual test output
  - `/mft` — Claude runs MFT scripts against the live app
  - `/wrap` — update CLAUDE.md, verify test count, commit, push
- **`settings-template.json`** — default permission allowlist. Stops Claude prompting
  for lint runs, test runs, git read operations, file inspection. Copy to `.claude/settings.json`.
- **Day-0 test infrastructure** in Session 0 checklist — test runner must be configured
  before any feature code. Explicitly lists what "configured" means (exits cleanly, even
  with 0 tests).
- **End-of-session close checklist** — mandatory 4-step close: run full suite, run audit,
  update CLAUDE.md, push. Runs at end of every session, not just at chunk boundaries.
- **Audit Point 9 hardened** — "paste the actual output" replaces "verify they pass".
  Closes the self-audit cheat of skipping the run.
- **Impact analysis as §7** — standalone section in FRAMEWORK.md with 7-question table,
  stack-specific extensions, and standardised output format.
- **`shared/` folder structure** — FRAMEWORK.md, PLAYBOOK.md, commands/, settings-template.json
  packaged together for `git clone` install.

### Breaking Changes
- Pipeline renamed from 7-step to 8-step. Step numbers shifted: old Step 1 (Design) is now
  Step 1 only after new Step 0 (Impact). If you had step-number references in your notes or
  CLAUDE.md, update them.
- FRAMEWORK.md moved from repo root to `shared/FRAMEWORK.md`. Update any symlinks or
  references to the old root location.

---

## How to read this changelog as an upgrader

Run `/upgrade` after `git -C shared pull` — it reads this file, shows only the entries
between your installed version and the version you pulled, and tells you which items need
manual action vs which are applied automatically.

Breaking Changes entries always require manual review. Everything else is applied
automatically by `/upgrade`.
