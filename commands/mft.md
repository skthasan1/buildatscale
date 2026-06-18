# /mft — Step 5: Manual Functional Test

Run the MFT scripts against a live running instance of the app.
Claude executes every scenario step by step and reports results.

## Input

The scenarios to run come from `docs/manual-test.md`.
If args are given (`/mft <scenario-ID>`), run only those scenarios.
Otherwise, run all scenarios marked as new or updated this session (check git diff on manual-test.md).

## What to do

### 1. Start the app

Use the project's dev start command to get a running instance.
For web projects: usually `pnpm dev` (already running if the dev server is up).
For desktop: usually `pnpm --filter @[app]/desktop dev`.
For API-only: `pnpm --filter @[app]/api dev`.

Use the `/run` skill if available in this project, or start the server directly.

If the app cannot be started in this environment (e.g. missing credentials, CI context):
- Say so explicitly
- List which scenarios need human verification
- Do NOT pretend to have run them

### 2. Execute each MFT scenario

For each scenario in `docs/manual-test.md` that was written or updated this session:

1. Read the scenario: precondition → steps → expected result
2. Set up the precondition (navigate to the right page, set up test data, etc.)
3. Execute each step exactly as written
4. Compare the actual result to the expected result
5. Mark **PASS** or **FAIL** with a specific observation

If a scenario FAILS:
- Record exactly what happened (what was shown vs what was expected)
- Note whether it's a UI issue, a data issue, or a logic error
- Do NOT fix it during this step — just record it
- **Always log it in `docs/bug-report.md`** — copy the entry template, assign the next BUG-NNN ID,
  fill in test ID, steps, expected, actual, and your name. Update the bug index table.
  This applies regardless of whether you are the developer or a tester — the log is always first.

### 3. Check for regressions

After the new scenarios, run 2–3 scenarios for features adjacent to this change
(identified in the `/impact` Step 0 output). Confirm they still work.

### 4. Report

```
MFT results — [date] — [plan-row ID]
──────────────────────────────────────
[Scenario ID] [name]       PASS / FAIL — [observation]
[Scenario ID] [name]       PASS / FAIL — [observation]
...

Regression checks:
[Scenario ID] [adjacent feature]   PASS / FAIL

Summary: [N] passed, [M] failed
```

### 5. Next steps

- All PASS → proceed to `/audit` (Step 6 re-audit) or report results if running independently
- Any FAIL → the bug is already logged (Step 2). Now decide:
  - **Fix now (same session):** create a plan row, fix the issue, merge the commit, update the bug
    entry (status: `fixed`, add commit reference), re-run the scenario, confirm PASS, close the bug.
    `Added by` and `Resolved by` being the same person is fine — the trail is still there.
  - **Hand off:** leave status `open`. The next developer to pick it up creates the plan row and
    follows the same fix → re-run → close cycle.

Either way, no bug is silently fixed without a log entry. That is the rule.

## Notes

Manual tests catch what automated tests don't: visual issues, timing, perceived
performance, copy errors, confusing UX flows. The goal is to experience the feature
as a user would, not to tick a box.

The bug log (`docs/bug-report.md`) is append-only — never edit another person's lines.
Add comments with your name and date; let the status and Resolved by fields tell the story.
