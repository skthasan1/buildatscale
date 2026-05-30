# Changelog — Build@Scale with AI

All notable changes are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com).
Versions follow [Semantic Versioning](https://semver.org).

**Major** — pipeline structure changes (new/removed steps, renamed core concepts)
**Minor** — new features (skills, sections, CI templates, stack support)
**Patch** — fixes (typos, broken commands, inconsistencies)

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
