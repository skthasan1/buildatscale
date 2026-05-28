# /pipeline — 8-Step Development Pipeline

Guide the user through the complete 8-step pipeline from `shared/FRAMEWORK.md`.
Run each step fully before moving to the next. Never skip a step.

## How to start

If no args are given, ask:
> "What are we building? Describe the feature, fix, or refactor in 1–2 sentences."

Then execute each step in order. After each step, print:
`✅ Step N complete — type /pipeline continue (or just say "continue") to proceed to Step N+1.`

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

## Usage

```
/pipeline                    — start fresh, asks what to build
/pipeline <feature desc>     — start with the feature already described
/pipeline continue           — resume at the current step
/pipeline step 3             — jump to a specific step (use sparingly)
```
