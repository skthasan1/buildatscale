# /sprint-retro — Sprint Retrospective

Run at the end of a sprint to close it formally: measure velocity, capture learnings,
resolve carry-overs, and set up the next sprint.

## Input

Args: sprint number (e.g. `/sprint-retro 1`).
Reads `docs/sprints/sprint-N.md` and `docs/project-log.md`.

## What to do

### 1. Estimated vs actual

Read the Sprint Metrics table from the sprint file. Compare:

| Metric | Target | Actual |
|--------|--------|--------|
| Plan-rows completed | 12 | ? (count ✅ rows) |
| Test count delta | +55 | ? (run test suite) |
| Target completion | YYYY-MM-DD | YYYY-MM-DD (today) |
| Sessions used | — | ? (count session notes) |

Run `[TEST_CMD] 2>&1 | tail -3` to get the actual test count.
Count session notes in CLAUDE.md from sprint-open to today.

Print the comparison table. Flag any metric where actual is <80% of target.

### 2. List carry-overs and get a decision

List every plan-row that is NOT ✅ done:

```
Carry-over candidates:
  ⏳ S1-8  Conflict resolution UI    — not started
  🔧 S1-9  Admin dashboard           — in progress, ~50% done
  🛑 S1-6  Entity resolution         — blocked (dependency never resolved)
```

For each, ask: **Drop / Defer to Sprint N+1 / Move to backlog?**
Record the decision in the sprint file. Update `docs/project-log.md` with the disposition:
- Drop → mark `❌ cancelled` with reason
- Sprint N+1 → leave as `⏳ planned`, note "carried from Sprint N"
- Backlog → leave as `⏳ planned`, remove from sprint scope note

### 3. AC coverage final check

Run the same AC coverage check as `/sprint-status` Step 3, but as a final verdict:

```
AC exit check:
  ✅ AC-1  Covered — all plan-rows done
  ✅ AC-4  Covered
  ❌ AC-9  NOT COVERED — S1-3 carried to Sprint 2
  ❌ AC-12 NOT COVERED — no plan-row was ever created
```

For any uncovered AC: record it in the sprint file as `❌ not met` and note in
the carry-over section which plan-row(s) will cover it next sprint.

### 4. Retro questions (3 questions, brief answers)

Ask the user:

1. **What slowed us down?** (blockers, unclear specs, unexpected rework, environment issues)
2. **What would we do differently?** (process, tooling, sequencing, scope decisions)
3. **What was a non-obvious win?** (something that worked better than expected, a decision that paid off)

Record all three answers in the sprint file under `## Retrospective Notes`.
These accumulate across sprints — they are the velocity memory of the project.

### 5. Write final metrics to sprint file

Update the Sprint Metrics table with actuals. Mark sprint status as `✅ Closed`.

### 6. Generate CLAUDE.md session note

Print a ready-to-paste session note:

```
### [YYYY-MM-DD] — Sprint N retro

Sprint N closed. [N] of [M] plan-rows done. [K] carried to Sprint N+1.
ACs met: [N]/[M]. Test delta: +[N] (total: [T]).
Carry-overs: [row IDs or "none"].
Retro: [one-sentence summary of the biggest lesson].
```

### 7. Open Sprint N+1

Ask: "Should I set Sprint N+1 to ✗ Not started with carry-overs noted?"
If yes:
- Find or create `docs/sprints/sprint-[N+1].md` from the template
- Add carried-over plan-rows to the sprint N+1 plan-rows section
- Note "carried from Sprint N" on each
- Update `docs/project-log.md` — Sprint N+1 phase header set to `✗ Not started`

Then stop. Sprint N+1 opens with `/sprint-plan [N+1]`.

## Notes

- Retro is not optional. A sprint without a retro has no velocity data and no lessons —
  the next sprint starts with the same blind spots.
- Keep retro answers brief (1–3 sentences each). The goal is a searchable record, not a
  post-mortem document.
