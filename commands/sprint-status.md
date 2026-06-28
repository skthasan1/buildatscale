# /sprint-status — Sprint Health Check

The "standup replace" for solo/small-team work. Reads `docs/project-log.md` and
the current sprint file, then prints a one-page health report. No args needed.

## What to do

### 1. Identify the current sprint

Find the current sprint phase in `docs/project-log.md` — the phase with `🔧 in progress`
or the most recently started sprint block. Read the corresponding sprint file at
`docs/sprints/sprint-N.md`. If no sprint file exists, report that and stop.

### 2. Compute plan-row progress

Count plan-rows in the current sprint by status:

```
Plan-rows: 4 ✅ done / 12 total (33%)
```

List any row that has been `🔧 in progress` for more than 3 days without a commit:

```
⚠ Stale (>3 days): S1-3 — MS365 calendar sync (in progress since 2026-07-01)
```

Stale = `🔧 in progress` with no new commits on its branch in the last 3 days.
Check `git log --since="3 days ago" --oneline` for each in-progress branch.
If you can't check git (no branch info), flag it based on the date in the session note.

### 3. Compute AC coverage

Read the AC → Plan-Row map from the sprint file. For each AC:

- **✅ Covered** — all mapped plan-rows are ✅ done
- **🔧 Partial** — some mapped plan-rows done, some in progress or planned
- **⏳ Not started** — no mapped plan-rows done yet
- **❌ Gap** — AC has no mapped plan-rows (was flagged at sprint-open, not resolved)

Print:

```
Acceptance Criteria:
  ✅ AC-1  Users can connect MS365               (S1-1 ✅, S1-2 ✅)
  🔧 AC-4  Sync runs on schedule                 (S1-1 ✅, S1-5 ⏳)
  ⏳ AC-9  All three integrations connected       (S1-2 🔧, S1-3 ⏳, S1-4 ⏳)
  ❌ AC-12 Admin can revoke integration — NO PLAN-ROW
```

### 4. List blocked rows

```
Blocked:
  🛑 S1-6 — Entity resolution  (waiting on S1-1, S1-2, S1-3)
  🛑 S1-7 — Conflict UI        (waiting on S1-6)
```

### 5. Test count

Read current test count from CLAUDE.md or run `[TEST_CMD] 2>&1 | tail -3`.
Compare to the sprint target from the Sprint Metrics table:

```
Tests: 47 current / 80 target (59%)
```

### 6. Print the report

```
Sprint N status — [YYYY-MM-DD]
──────────────────────────────────────────
Plan-rows:  4 ✅ / 12 total (33%)  ·  target: [date]
ACs:        2 ✅ covered · 1 🔧 partial · 2 ⏳ not started · 1 ❌ no plan-row
Tests:      47 / 80 target (59%)
Blocked:    S1-6, S1-7
Stale:      S1-3 (in progress >3 days)

── AC detail ──────────────────────────────
✅ AC-1  Users can connect MS365
🔧 AC-4  Sync runs on schedule  — S1-5 still in progress
⏳ AC-9  All three integrations  — S1-3 not started
❌ AC-12 Admin can revoke  — no plan-row mapped

── Blocked detail ─────────────────────────
S1-6 waiting on: S1-1 ✅, S1-2 ✅, S1-3 ⏳  →  S1-3 is the gate
S1-7 waiting on: S1-6 🛑

── Recommendation ─────────────────────────
Critical next: unblock S1-3 to unblock S1-6 and S1-7.
AC-12 gap: create a plan-row or explicitly descope before sprint close.
```

## Notes

Run any time — before starting a session, as a daily check, or when the sprint feels
behind. The output is designed to fit in a single terminal screen.

For a full sprint close-out (carry-overs, retro, metrics), use `/sprint-retro`.
