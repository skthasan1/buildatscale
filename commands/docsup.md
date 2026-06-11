# /docsup — Step 2: Docs First

Update all three doc categories BEFORE writing any implementation code.

## Input

The approved design comes from:
1. Args (`/docsup <plan-row ID>`)
2. The most recent approved design from `/design`
3. If unclear — ask which plan-row and design option was approved

## What to do (in order)

### 1. Plan-row — claim the chunk

In `docs/project-log.md`, find the plan-row for this chunk and mark it:
```
[ID] 🔧 in progress | [assigned] | [title] | branch: [current branch]
```

If no plan-row exists, create one and add it to the appropriate series.

### 2. API/data docs — contract before code

For each new or changed endpoint/schema in the approved design:
- Update `docs/api-reference.md` with the new endpoint signature, inputs, outputs, and error codes
- Update `docs/data-model.md` if the schema changes
- Write the contract in full — don't leave "TBD" sections

Writing the contract before the implementation forces you to think through the interface.
If you find yourself writing "TBD" because you haven't thought it through yet, go back
to `/design` and resolve it there.

### 3. MFT scripts — write test scenarios before coding

Add numbered scenarios to `docs/manual-test.md` for the feature being built.
These will be run in Step 5 (`/mft`). Writing them now forces you to think about
user-facing behaviour before getting lost in implementation details.

MFT scenario format — use a table per feature section:
```markdown
## [Feature ID]: [Feature name]
**Date tested:** pending
**Files:** `path/to/changed/file.ts`, `path/to/component.tsx`

| # | Scenario | Steps | Expected | Status | Notes |
|---|---|---|---|---|---|
| 1 | Happy path description | Step 1 → Step 2 → Step 3 | What the user sees/experiences | ⬜ | |
| 2 | Error / edge case | Trigger the edge condition | What should happen | ⬜ | |
| 3 | Regression guard — adjacent feature still works | Use the adjacent feature normally | It works unchanged | ⬜ | Regression guard |
```

Status values: `⬜` = not yet tested, `✅` = passed, `❌` = failed (file a fix before closing the session).
Update **Date tested** and all statuses when running `/mft`.

Write at least:
- The happy path (feature works as designed)
- One error/edge case
- One regression guard (something adjacent that should NOT break)

### 4. Confirm

Output a summary:
```
✅ Docs updated:
   - project-log.md: [ID] marked 🔧 in progress
   - api-reference.md: [N] endpoints updated
   - manual-test.md: [N] MFT scenarios added (scenarios [ID-01] through [ID-N])
   
Ready to build. Run /build to implement.
```
