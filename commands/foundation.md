# /foundation — Infrastructure Checklist

Run a 9-point infrastructure audit on the current project.
Use after any session where you added or changed infrastructure (not feature code).

**Use this when:** You've set up CI, added env vars, wired a new package, written dev-setup
docs, or done any "foundation" work that isn't a feature. This replaces `/audit` + `/mft`
for infrastructure sessions.

**Use `/audit` instead when:** You've written feature code with tests — use the full 10-point
audit for that.

**Use `/scaffold` instead when:** Starting from zero — `/scaffold` calls `/foundation`
automatically at the end.

**After `/foundation`:** Run `/wrap` to commit and close the session.

---

## What to do

Work through each of the 9 points in order. For each point, mark **PASS** or **FAIL**
with a one-sentence explanation. Read the actual files — do not skim.

---

### Point 1 — `.env.example`

Check that `.env.example` (at repo root, and per-app if your stack requires it):
- Exists and is committed
- Contains **every** env var any developer needs to run the app locally
- Has a comment explaining each var's purpose and where to get the value
- Uses blank values (not defaults that could be mistaken for real values)

Run: `grep -c "=" .env.example` — count should be ≥ 1 (more is better).

Also check: if a new env var was added to `.env` this session, is it in `.env.example` too?
New env var without a `.env.example` entry = FAIL.

### Point 2 — `.gitignore`

Check that `.gitignore` covers:
- `node_modules/` (or language equivalent)
- Build output directories (`.next/`, `dist/`, `out/`, `build/`)
- `.env` and `.env.local` (never committed — `.env.example` is the committed version)
- OS files (`.DS_Store`, `Thumbs.db`)
- IDE files (`.idea/`, `.vscode/` unless team-committed settings are intentional)
- Coverage reports (`coverage/`, `.nyc_output/`)
- Log files (`*.log`, `npm-debug.log*`)

Run: `git status --short` — if any of the above categories appear as untracked files, `.gitignore` is incomplete.

### Point 2b — `.claudeignore`

Does a `.claudeignore` exist at the repo root? Without it, Claude reads `node_modules/`,
`dist/`, lockfiles, and binaries on every context load — burning tokens that add no value
and can cause context-window overflows on large repos.

Check:
- `.claudeignore` exists at repo root and is committed
- It excludes at minimum: `node_modules/`, build output dirs, lockfiles (`pnpm-lock.yaml`,
  `package-lock.json`, `yarn.lock`), binary/media files (`*.png`, `*.jpg`, `*.woff2`, etc.),
  coverage dirs, and generated files

Use `shared/claudeignore-template` as the starting point if one doesn't exist yet.

Run: `cat .claudeignore` — confirm the file is present and non-empty.

FAIL if missing.

### Point 3 — Secrets guard

Check that the CI pipeline has a step that fails if any `.env` file or known secret
pattern appears in the diff.

Look for this in `.github/workflows/ci.yml` (or equivalent):
- A step that `grep`s the diff for patterns like `SECRET`, `PASSWORD`, `API_KEY`, `PRIVATE_KEY`
- OR a secrets-scanning tool (e.g. `trufflehog`, `detect-secrets`, `gitleaks`)

If no secrets guard exists: FAIL. Add one from `shared/ci/github-actions.yml` (the
"Secrets guard" step in the CI template).

### Point 4 — CI pipeline

Check that `.github/workflows/ci.yml` (or equivalent) exists and runs on every PR:
- Typecheck step (`tsc --noEmit` or equivalent)
- Lint step (if lint is configured)
- Unit test step (`pnpm test` or equivalent)
- Build verification step
- Secrets guard (covered in Point 3)

Manually verify the last CI run passed: `gh run list --limit 3` and check the status.

If CI is not configured yet: FAIL. Copy and adapt `shared/ci/github-actions.yml`.

### Point 5 — Dev quickstart

Check that `docs/dev-setup-guide.md` exists and covers:
- Prerequisites (Node version, package manager, required accounts)
- Clone step
- Install step (`pnpm install` or equivalent)
- Environment setup (copy `.env.example` → `.env`, fill in values — point to where to get them)
- Start step (`pnpm dev` or equivalent)
- Verify step — how to confirm the app is running

If any step would require a developer to ask you a question, it's incomplete: FAIL.

Bonus: can you follow the guide right now and start the app? If yes, PASS with confidence.

### Point 6 — Test baseline

Check that test runners are configured and exit cleanly:

Run the test suite:
```
pnpm test
```

Expected: exits 0. Even with 0 tests, the runner must exit cleanly. A broken runner
on day 0 = FAIL.

Check:
- `vitest.config.ts` / `jest.config.js` exists
- At least one smoke-test exists (even if trivial: `expect(1 + 1).toBe(2)`)
- `docs/testing-strategy.md` exists with starting counts per layer (even if all 0)

If `pnpm test` fails or the config doesn't exist: FAIL.

**Component/interaction test harness:** does the project have a component-level test harness (React Testing Library, Vue Test Utils, Storybook test runner)? Unit tests cover functions in isolation; E2E tests cover full browser flows. Component tests fill the gap: hover/focus affordances, event batching (debounce, throttle, flush trigger), and DOM ownership (portal placement, focus trap, scroll container). If no component harness exists, note the interaction-class gap in `docs/testing-strategy.md` — these bugs are structurally invisible to unit and E2E tests and can only be caught via manual test (`/mft`).

### Point 7 — Package / monorepo wiring

For monorepo projects, check that workspace packages resolve correctly:

- `pnpm-workspace.yaml` (or `workspaces` in root `package.json`) lists all packages
- Each package in `packages/` and `apps/` has its own `package.json` with a `name` field
- Cross-package imports work: if `apps/web` imports from `@project/db`, that import resolves

Run: `pnpm install` — should exit 0 with no unresolved peer dependency warnings that would
cause runtime failures.

For single-package projects: skip this point (mark PASS).

### Point 8 — Docs baseline

Check that Tier 1 docs exist (from `shared/FRAMEWORK.md` Section 5):

| File | Required |
|---|---|
| `CLAUDE.md` | Must exist, must have current status + tech stack |
| `docs/README.md` | Must exist, must list all current docs |
| `docs/project-log.md` | Must exist, must have at least the Phase 0 rows |
| `docs/architecture.md` | Must exist, even if brief |
| `docs/dev-setup-guide.md` | Covered in Point 5 |
| `docs/bug-report.md` | Must exist (even if empty) — the test team's bug log |

Also check: if a new service, env var, or infrastructure decision was added this session,
is it reflected in `CLAUDE.md` and the relevant docs?

### Point 8b — Settings dual-tool coverage (Windows check)

> Skip this point on macOS/Linux where only the `Bash` tool is used.

On Windows, Claude Code uses the `PowerShell` tool. A `Bash(...)` permission rule does NOT
match a `PowerShell(...)` call — guards are silently bypassed if only `Bash` variants exist.

Check `.claude/settings.json`:
- Every entry in the `ask` list has a matching `PowerShell(...)` variant alongside `Bash(...)`
- Every entry in the `allow` list has a matching `PowerShell(...)` variant (prevents prompt spam)

Run: `grep -c "PowerShell" .claude/settings.json` — should be ≥ 6 (one per `ask` entry at minimum).

If `PowerShell` entries are missing: FAIL. Copy from `shared/settings-template.json` — it ships
both `Bash` and `PowerShell` variants for every rule.

### Point 9 — Push

Confirm all changes are committed and pushed:

```bash
git status           # should show clean working tree
git log --oneline -3 # last 3 commits
```

All infrastructure changes from this session should be in a commit. Nothing left
uncommitted. Pushed to the remote branch.

---

## Output format

```
Foundation check — [date]
─────────────────────────────────────────────────────
Point 1   .env.example:       PASS / FAIL — [reason]
Point 2   .gitignore:         PASS / FAIL — [reason]
Point 2b  .claudeignore:      PASS / FAIL — [reason]
Point 3   Secrets guard:      PASS / FAIL — [reason]
Point 4   CI pipeline:        PASS / FAIL — [reason]
Point 5   Dev quickstart:     PASS / FAIL — [reason]
Point 6   Test baseline:      PASS / FAIL — [reason]
Point 7   Package wiring:     PASS / FAIL — [reason]
Point 8   Docs baseline:      PASS / FAIL — [reason]
Point 9   Push:               PASS / FAIL — [reason]

Items to fix:
- [list of FAILs with specific files/actions]
```

Fix all FAILs, then re-run `/foundation` until clean.

Once clean:
```
✅ Foundation check complete — all 9 points PASS.
   Run /wrap to commit the session and close.
```
