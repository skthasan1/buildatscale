# /audit — Step 4 / Step 6: Audit Checklist

Run the 10-point audit on everything changed in the current session.
Use for Step 4 (first pass after build) and Step 6 (re-audit after manual test fixes).

## Input

No args needed — audits the current working diff.
Run `git diff HEAD` or `git diff main` to see the full change set before starting.

## What to do

Work through each of the 10 points. For each point, mark **PASS** or **FAIL** with
a one-sentence explanation. Do not skim — read the actual diff.

---

### Point 1 — Code review

Read the diff end-to-end as if reviewing someone else's PR. Ask:
- Is anything confusing or surprising?
- Are there patterns you'd flag in a colleague's code?
- Is the code doing what the design specified?

### Point 2 — Docs updated

For every changed API endpoint, schema, or behaviour:
- `docs/api-reference.md` updated?
- `docs/data-model.md` updated (if schema changed)?
- `docs/manual-test.md` scenarios reflect the new behaviour?
- Architecture diagrams (if any) still accurate?

### Point 3 — Edge cases

For every input/output in the changed code:
- Null inputs handled?
- Empty arrays/collections handled?
- Concurrent calls safe?
- Network failure handled?
- Partial write / partial success handled?

Each edge case is either covered by a test OR explicitly documented as "not in scope."

### Point 4 — Bugs

Read the code for:
- Off-by-one errors
- Missing `await` on async calls
- Race conditions in shared state
- Wrong comparison operator (`=` vs `==` vs `===`, `<` vs `<=`)
- Swapped arguments

### Point 5 — Vulnerabilities

- Auth check present on every new protected route/endpoint?
- Input validation on every field accepted from user/external input?
- No secrets, tokens, or PII in log output?
- No SQL injection vector (parameterized queries)?
- No XSS vector (unescaped output)?

### Point 6 — Design alignment

Does the implementation match the approved design from `/design`?
If it diverged: was the design doc updated to reflect the change (with reasoning)?
"I changed my mind while coding" is valid — but the doc must reflect the new decision.

### Point 7 — Dev instructions

Is everything a future developer needs to know either:
- In the code as an inline comment (for non-obvious invariants / workarounds)?
- In a doc (linked from the code or CLAUDE.md)?

Nothing should live only in your head or in the chat history.

### Point 8 — Test coverage

Three-layer rule (from `shared/FRAMEWORK.md` Section 9):
- Unit tests: new functions/logic covered?
- E2E tests: new user flows covered?
- Manual test scenarios: written in `docs/manual-test.md`?

### Point 9 — Test execution ← MUST run, not assert

**Run the test suite now.** Paste the summary output below:

```
pnpm test
```

Output:
```
[paste actual output here — X passed, Y failed]
```

If any test is failing: fix it or document it as a known skip with a date and condition
to un-skip. "Tests should be passing" is not a substitute for running them.

### Point 10 — Cross-doc sync

- Test counts in CLAUDE.md match the output from Point 9?
- `docs/testing-strategy.md` updated (4-case rule from `shared/FRAMEWORK.md` Section 9)?
- All shipped plan-rows marked ✅ done in `docs/project-log.md`?

---

## Output format

```
Audit results — [date] — [plan-row ID]
─────────────────────────────────────────────
Point 1  Code review:      PASS / FAIL — [reason]
Point 2  Docs updated:     PASS / FAIL — [reason]
Point 3  Edge cases:       PASS / FAIL — [reason]
Point 4  Bugs:             PASS / FAIL — [reason]
Point 5  Vulnerabilities:  PASS / FAIL — [reason]
Point 6  Design alignment: PASS / FAIL — [reason]
Point 7  Dev instructions: PASS / FAIL — [reason]
Point 8  Test coverage:    PASS / FAIL — [reason]
Point 9  Test execution:   PASS — [X passed, Y failed]
Point 10 Cross-doc sync:   PASS / FAIL — [reason]

Items to fix:
- [list of FAILs with specific files/lines]
```

Fix all FAILs, then run `/audit` again until the audit is fully clean.
