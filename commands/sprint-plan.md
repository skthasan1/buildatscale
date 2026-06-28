# /sprint-plan — Sprint Kick-off Gate

Run at the start of every sprint to verify prerequisites, map acceptance criteria to
plan-rows, identify the critical path, and declare the sprint officially open.

**Never begin sprint work without running this.** The failure mode it prevents: discovering
mid-sprint that a prerequisite blocked 6 other plan-rows — which is already true once you
have a critical-path item and no sprint-open gate.

## Input

Args: sprint number (e.g. `/sprint-plan 1`) or the path to the sprint file.
The sprint file lives at `docs/sprints/sprint-N.md`.

## What to do

### 1. Verify prerequisites

Read the sprint file. Find the "Must be met before Sprint N begins" section.
For every listed prerequisite, check its status in `docs/project-log.md`:

- ✅ done → OK
- 🔧 in progress → surface it: "WARN — [row ID] is in progress, not done"
- ⏳ planned / 🛑 blocked / missing → **STOP. Do not open the sprint.**

Print the full prerequisite table with ✅/⚠/🔴 status for each item.
If any are 🔴, output:

```
❌ Sprint N cannot open — prerequisite [row ID] is not done.
Resolve it first, then re-run /sprint-plan N.
```

### 2. Map ACs to plan-rows

Read the Acceptance Criteria section of the sprint file.
For each AC, ask the user: "Which plan-row(s) cover this AC?"

Build the AC → Plan-Row map. Record it in the sprint file under
`## Acceptance Criteria → Plan-Row Map` (create section if missing):

```
| AC ID | AC Description              | Plan-Row(s)  | Status |
|-------|-----------------------------|--------------|--------|
| AC-1  | Users can connect MS365     | S1-1, S1-2   | ⏳     |
| AC-4  | Sync runs on schedule       | S1-1, S1-5   | ⏳     |
```

Status values: `⏳` not started, `🔧` partial (some rows done), `✅` all rows done.

If any AC has zero mapped plan-rows: flag it as a gap — it will be invisible until the
sprint-exit review.

### 3. Identify parallelizable and blocking rows

Read all plan-rows for this sprint. Identify:
- **Day-1 parallel work** — rows with no dependencies on other sprint rows
- **Critical path** — the longest dependency chain

Print the dependency graph in text DAG form:

```
## Dependency Graph
S1-0 → S1-1, S1-2, S1-3, S1-4, S1-5, S1-6, S1-7
S1-1, S1-2, S1-3 → S1-4
S1-4 → S1-6, S1-7

Critical path: S1-0 → S1-1 → S1-4 → S1-6 (4 steps)
Day-1 parallel: S1-1, S1-2, S1-3 (can start simultaneously after S1-0)
```

### 4. Record target completion date

Ask: "What is the target completion date for Sprint N?"
Record it in the sprint file Sprint Metrics table under `Target completion`.

### 5. Write AC map to sprint file and update plan-rows

- Write the completed AC → Plan-Row map to `docs/sprints/sprint-N.md`
- For each plan-row in the sprint, add the AC column: `AC-1, AC-4` (see Section 10 of
  `shared/FRAMEWORK.md` for the updated plan-row format)
- Update the Sprint Metrics table with total plan-rows count and test count target

### 6. Declare sprint open

Print:

```
✅ Sprint N is open — [YYYY-MM-DD]
─────────────────────────────────────
Prerequisites:  [N] ✅  [M] ⚠  [K] 🔴
ACs mapped:     [N] of [Total] — [K] gaps flagged
Critical path:  [row] → [row] → ... ([N] steps)
Day-1 parallel: [rows]
Target:         [YYYY-MM-DD]

Start with: [first row on the critical path or first parallel row]
```

Then stop. Sprint work begins when the user runs `/pipeline` on the first chunk.

## Notes

- Re-running `/sprint-plan N` on an already-open sprint is safe — it re-checks
  prerequisites and updates the AC map. Useful after carrying rows over from a prior sprint.
- If the sprint file doesn't exist, create it from `shared/templates/sprint-template.md`.
