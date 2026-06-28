# /pipeline — 8-Step Development Pipeline

Guide the user through the complete 8-step pipeline from `shared/FRAMEWORK.md`.
Run each step fully before moving to the next. **Never skip a step — including
during production firefighting.** The pipeline exists precisely for high-pressure
moments: skipping the audit is how one bug becomes two.

**Hotfix / production outage mode:** Compress each step to its minimum, but do
not omit it. Before writing a single line of code, state the impact (Step 0) and
confirm the approach (Step 1). After building, run the ONE test that covers the
changed code (Step 4 abbreviated). After merging, update CLAUDE.md (Step 7).
A 5-minute compressed pipeline beats a 2-hour regression investigation.

## How to start

### Stack detection (runs once per project, before Step 0)

Before the first pipeline run in a project, detect the tech stack so every step uses
the right commands. Look for these files to auto-detect:

| File found | Inferred stack |
|---|---|
| `package.json` with `next` | Web — Next.js |
| `package.json` with `expo` or `react-native` | Mobile — React Native/Expo |
| `package.json` with `electron` | Desktop — Electron |
| `apps/` with multiple `package.json` | Monorepo — pnpm/npm workspaces |
| `pyproject.toml` / `requirements.txt` | Python backend |
| `Cargo.toml` | Rust |
| `go.mod` | Go |
| `hardhat.config.*` / `foundry.toml` | Blockchain/Solidity |

If no files are found or detection is ambiguous, ask:

> "What are we building? Pick all that apply:
> a) Web app  b) Mobile app (iOS/Android)  c) Desktop app  d) API/backend only  e) Other: ___"

Then confirm the **test command** to use throughout this pipeline:
- Detected from `package.json` scripts? Use that.
- Monorepo? Suggest `pnpm -r test` or `pnpm --filter <package> test`.
- Python? `pytest`. Rust? `cargo test`. Go? `go test ./...`
- Default if nothing found: `pnpm test`

Store the answers as `STACK` and `TEST_CMD` — every skill will use them.
Only do this once. If the user has already answered, skip straight to Step 0.

---

If no args are given, ask:
> "What are we building? Describe the feature, fix, or refactor in 1–2 sentences."

Then execute each step in order. After each step, print:
`✅ Step N complete — type /pipeline continue (or just say "continue") to proceed to Step N+1.`

---

## Sprint gate (before Step 0)

Before starting impact analysis, verify three things:

1. **Plan-row exists** — does this chunk have an ID in `docs/project-log.md`?
   If not, create a row now (status `🔧 in progress`, assigned to the current developer).
   Do not proceed with anonymous work — untracked chunks become invisible to sprint metrics.

2. **Sprint is open** — is there a current sprint with `🔧 in progress` or `⏳ planned`
   rows? If yes, does this chunk belong to it? If the chunk is outside the open sprint
   scope, flag it: "This row is not in the current sprint — proceed anyway, or file it
   for Sprint N+1?"

3. **No blocker** — check the plan-row's dependencies. If any upstream row is
   `🛑 blocked` or `⏳ planned` (not yet done):

   ```
   ❌ Cannot start [row ID] — depends on [blocker row] which is not done.
   Resolve the blocker first, or confirm you're choosing to start anyway (document the risk).
   ```

If all three checks pass, continue to Step 0.

---

## Step 0 — Impact assessment

Run `/impact` for the described change. Do not summarize or abbreviate — run the full
7-question blast-radius analysis. State "design gaps" clearly if any question can't be
answered from the codebase.

Gate: user must acknowledge the impact analysis before Step 1.

---

## Step 1 — Design review

Run `/design` for the described change. Present exactly 2–3 options with trade-offs.
Do not propose a single approach — the user must choose.

Gate: user must explicitly approve one option before Step 2.

---

## Step 2 — Docs first

Run `/docsup` for the approved design:
- Mark plan-row 🔧 in progress in `docs/project-log.md`
- Update `docs/api-reference.md` for any new endpoints (contract before code)
- Write MFT scripts in `docs/manual-test.md` NOW (before coding)

Gate: confirm docs are updated and MFT scripts are written.

---

## Step 3 — Build

Run `/build` with the approved design. Implement + write auto-tests alongside the code.
Run the full test suite at the end. Paste the summary output.

Gate: test suite green.

---

## Step 4 — Audit (first pass)

Run `/audit`. Work through all 10 points. Point 9 requires pasting actual test output.
List every FAIL.

Gate: all FAILs fixed, re-run audit until clean.

---

## Step 5 — Manual test

Run `/mft`. Execute every MFT script written in Step 2 against the running app.
Report pass/fail for each scenario.

Gate: all MFT scenarios pass, or failures filed as new plan-rows.

---

## Step 6 — Re-audit

Run `/audit` again on anything changed during Step 5 fixes. Confirm test suite still green.

Gate: clean audit, green suite.

---

## Step 7 — Session wrap-up

Run `/wrap`:
- Mark plan-row ✅ done in `docs/project-log.md`
- Update CLAUDE.md: status, test count (real number from suite run), session note
- Commit and push

---

## Mid-session scope change

If the user requests a design or requirement change **after Step 2** — any point during Steps 3–6:

1. **Stop** — do not implement the new scope immediately.
2. **Run a targeted `/impact`** scoped to the change only. Takes two minutes. Answer: new files? New contracts? New entry points or surfaces? New tests?
3. **Minimal blast radius** (same files, same contracts, no new surfaces): update docs and MFT scenarios inline, continue on the current branch.
4. **Non-trivial blast radius** (new files, new API contracts, new entry points): file a new plan-row, tackle as a separate chunk. The current chunk closes as-is.

**The rule:** a scope change mid-build is a new Step 0, not a free implementation. Two minutes of targeted impact analysis now prevents a mid-Step-5 discovery that breaks the re-audit.

---

## Usage

```
/pipeline                    — start fresh, asks what to build
/pipeline <feature desc>     — start with the feature already described
/pipeline continue           — resume at the current step
/pipeline step 3             — jump to a specific step (use sparingly)
```
