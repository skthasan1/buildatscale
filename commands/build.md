# /build — Step 3: Build

Implement the approved design. Write auto-tests alongside the code, not afterward.

## Input

The approved design from `/design` and the docs/contracts from `/docsup`.
If either hasn't been done, say so and run them first.

## What to do

### 1. Re-read the contracts

Before writing the first line, re-read:
- The API contracts written in `docs/api-reference.md`
- The MFT scenarios in `docs/manual-test.md`
- The impact analysis findings from `/impact`

These are the spec. If the implementation would diverge from the contract,
update the contract first (back to `/docsup`) — don't quietly make the code
do something different than what was documented.

### 2. Implement with tests alongside

For every function/endpoint/component you write:
- Write the implementation
- Write the unit test in the same step — not afterward
- A function without a test is unfinished work

Test-alongside rule: the test file should grow at roughly the same rate as the
implementation file. If you've written 5 functions and 0 tests, stop and write tests.

### 3. Scope discipline

Stay scoped to the plan-row. If you discover an adjacent issue:
- File it as a new plan-row in `docs/project-log.md` (⏳ planned, no branch yet)
- Do NOT fix it now
- Do NOT bundle it into this PR

### 4. Run the full test suite

When implementation is complete, run:
```
pnpm test          # unit tests
pnpm test:e2e      # E2E tests (if affected by this change)
```

Paste the summary output. Fix any failures before proceeding. A green suite is
the signal that Step 3 is complete — not "the code compiles."

If tests are red and you can't fix them in a reasonable time, document the failure
clearly and continue (but flag it at the audit step and in the session wrap-up).

### 5. Confirm

```
✅ Build complete:
   - [N] files changed
   - [N] new unit tests
   - [N] new/updated E2E tests
   - Test suite: [X passed, Y failed]
   
Run /audit for the first-pass audit.
```
