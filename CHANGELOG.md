# Changelog — Build@Scale with AI

All notable changes are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com).
Versions follow [Semantic Versioning](https://semver.org).

**Major** — pipeline structure changes (new/removed steps, renamed core concepts)
**Minor** — new features (skills, sections, CI templates, stack support)
**Patch** — fixes (typos, broken commands, inconsistencies)

---

## [2.11.0] — 2026-08-24

### Added

- **`shared/FRAMEWORK.md` §5 — `docs/ux-patterns.md` (Tier 1 doc):** added to the Session 0 doc checklist alongside CLAUDE.md and project-log.md. Includes a full starter template covering color tokens, typography scale, spacing/layout conventions, component inventory, approved patterns (empty state, loading, error, confirmation modal, toast), anti-patterns list, and responsive breakpoints. Projects fill in [PLACEHOLDER] values at Session 0; an empty template still satisfies the existence gate.
- **`shared/FRAMEWORK.md` §9 — UX consistency scenario:** new MFT scenario type for any chunk where UI surface was touched: token check (DevTools inspect), four-state check (loading/empty/error/success), keyboard check (Tab+Enter+Escape+focus ring), responsive check (375px), pattern check (`docs/ux-patterns.md`). Marked `[UX: visual/interaction check]` in manual-test.md — requires human eye, not a functional assertion.
- **`/foundation` Point 8 — `docs/ux-patterns.md` gate:** `docs/ux-patterns.md` added to the required Tier 1 docs table. FAIL if missing. Fix: create from the starter template in `shared/FRAMEWORK.md §5`. Runs automatically on `git clone shared` + setup prompt → `/foundation`, ensuring UX patterns doc exists before any UI code is written.
- **`/impact` Q9 — UI surface:** ninth impact question: does this change add or modify UI? If yes: which existing component in `docs/ux-patterns.md` is the closest precedent? Reuse or new pattern (with reason). A "yes" answer triggers the UX scenario in `/mft` and Point 11 in `/audit`. Output block gains `UI surface:` row.
- **`/audit` Point 11 — UX consistency:** five-check UX gate, runs only when `/impact` reported `UI surface: yes` (N/A for API/schema/infra-only changes): (1) token compliance — no raw hex or inline style for token-system values; (2) four-state completeness — loading/empty/error/success all handled; (3) keyboard accessibility — Tab reachable, Enter/Space activates, Escape closes modals, focus ring visible; (4) focus ring — `focus:ring-*` or `focus-visible:ring-*` on every interactive element; (5) reuse check — new pattern justified and documented in `docs/ux-patterns.md`. Output format updated with `Point 11 UX consistency: PASS / FAIL / N/A`.
- **`/mft` — UX consistency scenario:** step-by-step UX scenario template added above the interaction-class bugs section. Five sub-checks matching `/audit` Point 11. Failure logs to `docs/bug-report.md` with sub-check number and observation.

---

## [2.10.0] — 2026-08-24

### Added

- **`shared/FRAMEWORK.md` §9 — Regression suite (docs/regression-suite.md):** new subsection documenting the three-tier testing cadence: Tier 1 per-feature MFT (Step 5 pipeline), Tier 2 Quick Smoke (pre-merge to main), Tier 3 Full Regression (pre-release / major infra change). Covers the `docs/regression-suite.md` artifact structure (Quick Smoke table, Full Regression layers, Run Log), the E2E coverage shortcut rule (automated E2E passes → skip corresponding manual rows), and when to escalate between tiers. Motivated by the gap between "tests pass per-feature" and "whole product still works".
- **`shared/FRAMEWORK.md` §9 — Worker output flooding gotcha:** added to E2E gotchas: set `stdout:"ignore", stderr:"ignore"` on the worker webServer entry when a background worker retries continuously during test runs; output flooding causes assertion timeouts and flaky failures.
- **`/mft` — Testing tiers table:** new top-of-skill table mapping each tier to its artifact, trigger, and coverage scope. Clarifies that `/mft` runs Tier 1 by default and describes when to escalate to Quick Smoke (Tier 2) or Full Regression (Tier 3). References `shared/FRAMEWORK.md §9` for the `docs/regression-suite.md` template when it doesn't exist yet in the project.

---

## [2.9.0] — 2026-08-24

### Added

- **`/audit` Point 3 — Counter-factual verification (R3):** after verifying green with the fix present, remove the fix and reproduce the original failure. A passing test suite with the fix in place proves the fix doesn't break anything; only the counter-factual proves it does something.
- **`/audit` Point 9 — Build artifact check (R1):** when a change touches module boundaries, exports, or build-config files, the built artifact must be executed (not just built) before marking Point 9 PASS.
- **`/audit` Point 9 — Test suite coverage assertion (R2):** assert package count (monorepos), skip count, and count drift against CLAUDE.md. Exit 0 is necessary but not sufficient.
- **`/mft` — Interaction-class bugs (R10a):** explicit list of defects that unit tests structurally cannot surface: hover/focus affordances, event batching, DOM ownership, perceived timing. Mark these with `[INTERACTION: visual/timing check]` in manual-test.md.
- **`/impact` — Grep before you size (R8):** Step 0 (pre-search) — before estimating scope, grep for the column/function/endpoint to check whether a half-built implementation already exists.
- **`/impact` Q7 — Invocation check (A5 re-raise):** "what actually invokes this in the deployed environment?" — logic without wiring is unreachable code.
- **`/design` — Measure scale before choosing design (R11):** when design viability depends on data scale, seed the actual scale and measure before committing. Distinguish size of input from size of rendered consequence.
- **`/foundation` Point 6 — Component/interaction harness check (R10b):** note whether the project has a component-level test harness (RTL, Vue Test Utils). Flag the interaction-class gap if not.
- **`/security` A01 — Tenant isolation (B3):** added tenant-isolation row — for B2B features, verify tenant ID is in every WHERE clause, not just user ID.
- **`/security` A03 — Fence delimiter note (B3 fence):** the `<untrusted-data>` delimiter must be one the untrusted content cannot contain; reference to §18.5 fence containment.
- **`/security` A05 — Committed defaults (B4):** `process.env.X ?? '<literal>'` anti-pattern; full-mode "new" qualifier removed.
- **`/security` A07 — Bypass property not implementation (B2):** rewritten to ask (a) what makes the bypass unreachable in the deployed config, (b) whether the bypass credential is unforgeable.
- **`/security` SEC-NNN format — Reachability field (C1):** added `Reachability:` field; unverified findings are capped at Medium severity.
- **`/security` — Stack-agnostic sweep + security surface map template (B1):** introductory note to adapt terminology to the project's access control model; `CLAUDE.md` security surface map template.
- **`shared/FRAMEWORK.md` §9 — Known limits as passing tests (R4):** limits claimed by security/integrity features must be enforced by a passing test, not a comment.
- **`shared/FRAMEWORK.md` §11 Rules 9+10 — Worktree per agent (R7) + clean merge ≠ agreement (R9):** one worktree per parallel agent; never `git add -A`; semantically clean merges require a human review when both sides touch the same concept.
- **`shared/FRAMEWORK.md` §17 — Control the search (R5):** run a known-hit control before trusting zero results; prefer loud-failure search tools.
- **`shared/FRAMEWORK.md` §18.2 — Committed fallback anti-pattern (B4):** `?? '<literal>'` is worse than a missing value on security-sensitive env vars.
- **`shared/FRAMEWORK.md` §18.5 — Fence delimiter containment (B3):** the untrusted-data delimiter must be one the user cannot produce; nonce-based delimiter option.
- **`shared/FRAMEWORK.md` §18.6 — Versioned signature downgrade oracle (R12) (NEW SECTION):** attacker-controlled version prefix → downgrade attack; monotonic progression gate; distinguish unverifiable from invalid; `alg:none` rediscovery pattern.
- **`shared/FRAMEWORK.md` §21.4 — Prompt-spec defects (R6) (NEW SECTION):** prompt-spec defects are latent across model updates; treat model version bumps as dependency upgrades; unexpected classifier output log as early warning.

---

## [2.8.0] — 2026-08-21

### Added
- **`/security` skill** (`shared/commands/security.md`, `.claude/commands/security.md`) — two-mode security review skill:
  - **Targeted mode** (`/security <chunk-id>`) — called from the pipeline at Step 3.5 when `/impact` flags `Security surface: yes`. Sweeps the changed surface only: threat model, OWASP A01–A10 checklist, `pnpm audit`. Medium+ findings block the pipeline like an audit FAIL.
  - **Full mode** (`/security`) — periodic full-surface sweep. Runs quarterly or pre-release. Covers threat model, OWASP sweep, privilege escalation matrix for all roles, data exposure check. Produces `docs/security-audit.md` with SEC-NNN findings (severity: Critical/High/Medium/Low/Info).

### Changed
- **Pipeline** (`shared/commands/pipeline.md`, `.claude/commands/pipeline.md`) — added **Step 3.5** (conditional security review) between Build and Audit. Triggered only when impact assessment reports `Security surface: yes`; skipped entirely otherwise.
- **`/impact`** (`shared/commands/impact.md`, `.claude/commands/impact.md`) — added **8th question: Security surface**. Output block now includes a `Security surface: yes/no` row. Trigger criteria: new/modified auth guard; new public endpoint; payment flow; schema change to user/session/permission/invite tables; new PII or credential field; new external HTTP call; new file upload/download path; new admin capability.
- **`/audit` Point 5** (`shared/commands/audit.md`, `.claude/commands/audit.md`) — extended with two new baseline checks: **IDOR guard** (ownership verified against authenticated user for every record-by-ID operation) and **security gate satisfied** (if impact flagged security-relevant, `/security` was run and Medium+ findings were fixed).
- **`shared/FRAMEWORK.md` §18** — added security review cadence section: per-chunk (targeted, Step 3.5) vs. periodic (full, quarterly/pre-release). Explains the two-layer model and when each applies. References `shared/commands/security.md`.
- **`shared/FRAMEWORK.md` §7** — impact block extended with 8th question (Security surface) and trigger criteria.
- **`shared/FRAMEWORK.md` §6** — pipeline description extended with Step 3.5 (conditional security gate).

---

## [2.7.1] — 2026-08-21

### Changed
- **§8 Audit Point 3 — Edge cases** (`FRAMEWORK.md`) — added sibling-function check: when a bug's root cause lives in a function with a structurally similar sibling (mirrored extractors, parallel route handlers), the audit is not satisfied until the sibling has been actively checked and live-tested — not just flagged as "theoretical risk." (Kairo: BUG-225/226/227, same extraction bug in three consecutive sessions.)
- **§9 Three-layer testing** (`FRAMEWORK.md`) — added mandatory MFT scenario requirements for matching/extraction/classification fixes: (1) adjacent-similarity scenario (2+ similar items, correct one verified), (2) sequence scenario (action 2 after action 1's side effect), (3) "verified" defined as downstream state — DB read or UI check, not function return value alone, (4) repeat-mechanism escalation rule — second bug with identical mechanism triggers a full site sweep before continuing.
- **`.claude/commands/audit.md`** — Point 3 extended with sibling-function check (mirrors §8).
- **`.claude/commands/mft.md`** — verification standard for matching/extraction scenarios made explicit (downstream state required); repeat-mechanism escalation rule added to execution step.

---

## [2.7.0] — 2026-08-21

### Added
- **§21 AI product patterns** (`FRAMEWORK.md`) — three production-validated patterns from Kairo field data:
  1. **§21.1 LLM classifier/router** — allowlist + fail-loud default for classifier output; log unexpected labels for prompt tuning; use structured output (JSON Schema / tool call) instead of free-form string labels.
  2. **§21.2 Fallback allowlist, not blocklist** — model the bounded set of permitted categories; anything not on the allowlist is blocked by default; the blocklist is an adjunct fast-path, never the primary gate.
  3. **§21.3 Stale confirmation state** — confirmation-state write (`status = "APPROVED"`) must be the *last* operation after all side effects succeed; audit gate added for any endpoint that sets a terminal status field.
- **§22 Live reproduction and dev tooling hygiene** (`FRAMEWORK.md`) — two rules:
  1. **§22.1 Live reproduction before diagnosis** — write the minimal reproduction recipe and reproduce the failure in the running system before opening any source file; prevents fixing the wrong layer.
  2. **§22.2 Dev tooling hygiene** — every script in `scripts/` carries a top-of-file contract (purpose, target environment, idempotency, teardown path); single-use scripts are deleted after their date; prod-destructive scripts require an explicit flag.

### Changed
- **§8 Audit Point 4 — Bugs** (`FRAMEWORK.md`) — extended with two new checklist items:
  - **Optimistic confirmation-state** — is status set before or after the mutation succeeds? What happens on partial failure in a batch? Easy to reintroduce because new code copies the nearest pattern, not the correct one.
  - **Union-extension exhaustiveness** — when a discriminated union gains a new value, every switch/if-else-if chain branching on it must be audited. A trailing bare `else` silently absorbs new values.
- **§8 Audit intro** (`FRAMEWORK.md`) — added large-diff guidance: split the audit into two concurrent tracks (deterministic checks in foreground + adversarial read as a background subagent) for diffs touching 10+ files.
- **§2 Bootstrap checklist — Test infrastructure** (`FRAMEWORK.md`) — added shared dev/prod DB hygiene item (Pattern 5): hard-delete teardown in tests, collision-proof nonsense tokens for "must not match" assertions.
- **`.claude/commands/audit.md`** — Point 4 updated to match the extended §8 bullets (optimistic confirmation-state, union exhaustiveness).

---

## [2.6.1] — 2026-07-17

### Changed
- **CI template** (`ci/github-actions.yml`) — five cost optimisations applied by default:
  1. **PR-to-main only trigger** — removed `push: branches: [dev]`; CI fires only on PRs to `main`. Eliminates 60–70% of minutes for projects with active dev branches.
  2. **Concurrency cancel** — `concurrency.cancel-in-progress: true` kills stale runs when a new commit arrives on the same PR.
  3. **Merged check job** — `typecheck` + `lint` + `test` combined into one job; saves 2–3 min of setup overhead per run (one checkout + install instead of three).
  4. **Build job removed** (commented out) — deploy platforms (Vercel, Railway, Render, Fly.io) build on every PR and provide a preview URL; running `pnpm build` in CI is redundant. Job is preserved as a commented example for projects that need a build artifact.
  5. **`paths-ignore`** — `docs/**`, `**.md`, `.claude/**`, `shared/**` skip CI so docs-only PRs don't burn minutes.

### Why this matters
> These optimisations together can reduce CI minutes by 70–80% on projects with active dev branches, without weakening the gate. The merged check job and cancelled-in-progress runs were the highest-impact individual changes.

---

## [2.6.0] — 2026-06-28

### Added
- **`/sprint-plan` command** (`commands/sprint-plan.md`) — sprint kick-off gate: verifies prerequisites are ✅ before opening a sprint, maps acceptance criteria to plan-rows, identifies parallelizable day-1 work and the critical path, records target completion date, and prints a "Sprint N is open" declaration. Prevents the failure mode of discovering mid-sprint that a prerequisite was blocking six other rows.
- **`/sprint-status` command** (`commands/sprint-status.md`) — mid-sprint health check: shows % plan-rows done, AC coverage (✅ covered / 🔧 partial / ⏳ not started / ❌ no plan-row), blocked rows with dependency chain, stale rows (in progress >3 days without commits), and test count vs sprint target. Designed to fit in one terminal screen — the standup replace for solo/small-team work.
- **`/sprint-retro` command** (`commands/sprint-retro.md`) — sprint close-out: estimated vs actual metrics, carry-over decisions (drop / Sprint N+1 / backlog), final AC coverage verdict, three retro questions (slowed us / do differently / non-obvious win), CLAUDE.md session note generator, and Sprint N+1 setup with carry-overs noted.
- **Sprint template** (`templates/sprint-template.md`) — canonical structure for `docs/sprints/sprint-N.md`: goal, prerequisites table, acceptance criteria, AC→Plan-Row map, dependency graph, plan-rows table with AC column, sprint metrics, retrospective notes, carry-overs. Used by `/sprint-plan` when the sprint file doesn't exist.
- **Session type map** updated in `§2` — three new rows: "Sprint kick-off", "Sprint health check", "Sprint close".

### Changed
- **Plan-row format** (Section 10) — added `AC(s)` column after `title`. Links each chunk to the acceptance criteria it satisfies. Use `—` for non-sprint rows. Explicit gap detection: if an AC has no mapped rows, `/sprint-plan` flags it before work begins.
- **`/pipeline` Step 0** — sprint gate added before impact assessment: (1) verify plan-row exists, (2) confirm chunk belongs to the open sprint, (3) check for upstream blockers. Surfaces blocked chunks before any code is written.
- **`/wrap` Step 1** — AC sync added after marking plan-row ✅: checks if this completes the last row for any AC, marks that AC ✅ in the sprint file, and updates the Sprint Metrics row count. Sprint health stays current without a separate manual step.

### Why this matters
> The 8-step pipeline has per-chunk rigour. The gap was at sprint level — no formalized kick-off gate, no AC→row linkage, no mid-sprint health check, no structured retro. The result: starting sprints with unresolved blockers, shipping all plan-rows but missing an AC, and having no velocity data at sprint close. These three commands and two enhancements close that gap without adding ceremony to per-chunk work.

---

## [2.5.7] — 2026-06-22

### Added
- **`§9` Web app E2E auth bypass** — `globalSetup` JWT/cookie pattern as the standard approach: mint a real token using the auth framework's own functions, write to `storageState.json`, load via `playwright.config.ts`. Includes concrete NextAuth/Auth.js example + equivalents for Supabase Auth and custom JWT. Explains why env-var injection and server-side bypass guards fail (middleware fires before route handlers; modern bundlers don't reliably inject `webServer.env`).
- **`§9` AI / LLM mocking in E2E** — `page.route()` network intercept as the correct boundary. Includes intercept snippets for Anthropic and OpenAI endpoints. Documents why server-side `if (AI_MOCK)` guards are wrong: production risk, bundler tree-shaking unreliability, test-only code paths in prod.
- **`§9` E2E gotchas bullet list** — four generalizable traps distilled from real project failures:
  - Strict-mode locators — use `{ exact: true }` when asserted text can appear in multiple elements
  - Env var injection unreliability — don't trust `webServer.env` for server-side code in modern bundlers
  - Dotenv comment parsing — strip inline comments (`KEY=val # comment`) in globalSetup
  - Framework middleware fires before route handlers — server-side bypass guards in handlers are unreachable

### Why this matters
> The Electron `APP_TEST_TOKEN` pattern already in §9 works cleanly because the desktop app owns its own auth layer. Web apps are harder: auth middleware runs at the framework level, before any application code. The `storageState` + real-token approach is the correct web equivalent — it authenticates at the HTTP boundary the framework actually checks, without any server-side test scaffolding. The `page.route()` AI mock is the same idea applied to external APIs.

---

## [2.5.6] — 2026-06-21

### Added
- **Mid-session scope change protocol** (`pipeline.md` + `FRAMEWORK.md` §6) — when the user requests a design change after Step 2, the pipeline now mandates a pause and targeted `/impact` before writing a single line. Minimal blast radius → update docs inline and continue; non-trivial blast radius → new plan-row, separate chunk. The rule: a scope change mid-build is a new Step 0, not a free implementation.
- **`/impact` Q2 — parallel entry points sub-question** — Question 2 now explicitly asks: are there other entry points (routes, bot handlers, CLIs, desktop IPC handlers, mobile screens) that call the same shared functions? Previously only asked about type/API shape consumers; parallel surfaces that share functions but don't change types were invisible to the impact check.
- **`/audit` Point 4 — inconsistent call sites check** — when a shared helper is introduced or changed, the audit now checks that ALL call sites use it. Catches the case where sibling routes/handlers are left with hardcoded fallbacks while others call the real function.
- **`/audit` Point 4 — React key uniqueness check (web projects)** — keys must be globally unique within the parent render, not just locally unique within a single inner `.map()` call. Keys from indices or regex positions collide when the same map runs in an outer loop.
- **Multi-surface coverage prompt** (`docsup.md` + `mft.md`) — before writing MFT scenarios (`/docsup` Step 3) and before running them (`/mft` Step 2), both skills now ask: "Does this feature exist on multiple surfaces?" At least one scenario required per surface. A feature tested only on web but also exposed via desktop IPC, a webhook, or a CLI is half-tested.

### Why this matters
> All five gaps share the same root cause: the framework checked the code being changed but not the wider surface it operated on. Parallel entry points, outer-loop key collisions, and multi-surface features are all invisible to a check that only looks at the diff. These additions extend the blast radius and test coverage checks outward — from "what changed" to "what else touches this."

---

## [2.5.5] — 2026-06-20

### Added
- **`.claudeignore` support** — `shared/claudeignore-template` added; `.claudeignore` created in
  Vybev root (excludes `node_modules/`, build artefacts, `dist/`, `coverage/`, `.next/`,
  `apps/desktop/out/`, `packages/db/generated/`, large binary dirs, and secrets files); `/foundation`
  Point 9 updated with a `.claudeignore` check so every new project includes one from the start.
- **§20 Performance & cost** — new FRAMEWORK.md section with five subsections:
  - **§20.1 `.claudeignore`** — what to exclude (build output, generated files, large binaries,
    secrets), why it matters (context window, latency, cost), and the claudeignore-template as the
    canonical starting point.
  - **§20.2 Cache stability** — keep system prompts / CLAUDE.md headers stable; append-only edits
    preserve cache hits; restructuring the top of CLAUDE.md busts the cache for every message.
  - **§20.3 Effort calibration** — match `/audit` effort level to task risk (low for doc fixes,
    medium for standard features, high for security or data-path changes); avoid over-running
    expensive searches on trivial patches.
  - **§20.4 Model selection** — use Haiku 3.5 for high-volume background tasks (worker pre-screening,
    digest generation, batch summarisation); reserve Sonnet / Opus for reasoning-heavy or
    user-facing flows.
  - **§20.5 Plan mode** — run `claude --plan` before large refactors or multi-file changes; plan
    costs a fraction of execution and surfaces blast radius before any file is touched.
- **`settings-template.json` `MAX_THINKING_TOKENS` env var** — added with an inline note explaining
  that raising this above 10 000 enables extended thinking on Sonnet 3.7+ but increases cost;
  recommended to leave unset (uses model default) unless a reasoning-heavy flow needs it.

### Why this matters
> Context window bloat is the single biggest avoidable cost driver in agentic Claude Code sessions.
> A repo with `node_modules/`, `.next/`, and `packages/db/generated/` included in context sends
> hundreds of thousands of tokens of irrelevant content on every tool call. The `.claudeignore`
> template gives projects a correct starting point in under a minute. Pairing that with §20's
> cache-stability and effort-calibration guidance means projects keep the Claude Code bill
> proportional to the actual work being done — not to the size of the repo's build artefacts.

---

## [2.5.4] — 2026-06-20

### Fixed
- **Conversational testing feedback now triggers bug-log process** — `/mft` was only applying
  the log-first rule when formally invoked. If a user gave testing feedback conversationally
  ("this is broken", "I see X instead of Y"), the model treated it as a direct change request
  and fixed silently. Now both modes — formal `/mft` and conversational feedback — follow the
  same process: treat as FAIL findings, log first, ask "fix now or hand off?", never fix silently.
- **Explicit "fix now or hand off?" prompt in `/mft` Step 5** — previously described both
  options without prompting the user to choose. Step 5 now includes an explicit ask so the
  decision is surfaced rather than assumed.
- **`/mft` "When this applies" section added** — documents the two trigger modes (formal vs
  conversational) at the top of the skill so the rule is visible before the first scenario runs.
- **FRAMEWORK.md §6 Step 5** updated with the conversational feedback rule.
- **CLAUDE.md "Standing testing rule"** section added — session-level instruction so the rule
  applies in every conversation, not only when `/mft` is formally invoked.

### Why this matters
> The bug-log rule was framework-correct but conversation-blind. A user saying "here are some
> fixes I found" during a testing session reads as a change request, not an MFT FAIL — and the
> model was treating it that way. The fix is to make the rule sticky at the session level
> (CLAUDE.md standing rule) and explicit at the skill level (`/mft` "When this applies"), so
> conversational testing feedback cannot bypass the log.

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
