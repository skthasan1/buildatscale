# /audit — Step 4 / Step 6: Audit Checklist

<!--
  TEST_CMD: set by /pipeline at project start, or override here.
  Default: pnpm test   |   Monorepo: pnpm -r test   |   Python: pytest   |   Rust: cargo test
-->

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

**Counter-factual verification** — for any guard, gate, or refusal fix: after confirming the suite is green with the fix in place, remove the fix and verify the original failure reproduces. A test that passes with the fix present proves the fix doesn't break anything; only the counter-factual proves the fix actually does something. A passing test that was never run without the fix is not evidence of correctness.

### Point 4 — Bugs

Read the code for:
- Off-by-one errors
- Missing `await` on async calls
- Race conditions in shared state
- Wrong comparison operator (`=` vs `==` vs `===`, `<` vs `<=`)
- Swapped arguments
- **Inconsistent call sites** — if a shared helper was introduced or changed, do ALL call sites use it? Check for sibling routes or handlers left with a hardcoded fallback while others call the real function.
- **(Web/React)** List keys are globally unique within the parent render — not just locally unique within a single inner `.map()` call. Keys derived from indices or regex positions collide when the same `.map()` runs multiple times in an outer loop.

### Point 5 — Vulnerabilities

Baseline checks (every chunk):
- Auth check present on every new protected route/endpoint?
- Input validation on every field accepted from user/external input?
- No secrets, tokens, or PII in log output?
- No SQL injection vector (parameterized queries only — especially raw DB calls)?
- No XSS vector (unescaped output)?
- **IDOR guard** — for any procedure that fetches/writes a record by ID, is record ownership verified against the authenticated user (or an explicit admin bypass)?
- **Security gate satisfied** — if `/impact` reported `Security surface: yes`, was `/security` run at Step 3.5 and were all Medium+ findings fixed?

Hardening patterns (full detail in `shared/FRAMEWORK.md` §18):
- **Timing-safe comparison** — any shared secret, webhook token, or API key compared with `===`? Use `timingSafeEqual` instead (§18.1).
- **Fail-loud env var** — any `process.env.X` accessed inside a handler without a startup-time `requireEnv()` guard? Silent `undefined` = wide-open gate (§18.2).
- **Webhook endpoints** — verifying shared secret (timing-safe) AND sender allowlist? Or using the provider SDK's HMAC verification for third-party webhooks? (§18.3)
- **Long-lived credentials in DB** — stored encrypted (AES-256-GCM)? Never plaintext? (§18.4)
- **AI products only** — user-provided content passed to an LLM without `<untrusted-data>` wrapping and system prompt hardening? (§18.5)

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

**Run the test suite now using `TEST_CMD`.** Paste the summary output below:

```
[TEST_CMD]    # the command confirmed at project start via /pipeline
```

Output:
```
[paste actual output here — X passed, Y failed]
```

If any test is failing: fix it or document it as a known skip with a date and condition
to un-skip. "Tests should be passing" is not a substitute for running them.

**Assert coverage of the run — not just exit 0:**
- **Package count** (monorepos): how many packages actually ran tests? Compare against the number of packages in `apps/` and `packages/`. A test command that runs 1-of-5 packages exits 0 while having run a fraction of the suite. If the count is unexpected, fix the test command before marking PASS.
- **Skip count**: check for `test.skip` / `describe.skip` / `it.skip` in the output. Zero unexpected skips — a skip added because an env var is missing is a CI gap if that var is listed in `.env.example`. Document any deliberate skips with a date and un-skip condition.
- **Count drift**: if the test count in Point 9 output disagrees with the number recorded in CLAUDE.md, that disagreement is the finding — resolve it before closing the audit.

**Production artifact check** (when the change touches module boundaries, exports, build config, or framework-magic files — e.g. `next.config.*`, `vite.config.*`, `electron-builder.yml`, package `exports` field):
- Building the artifact is necessary but not sufficient. The built artifact must be executed. Examples: for desktop, `electron ./dist/main.js` must load the renderer without crashing; for web, the built page must load and the first API call must succeed. Add this verification before marking Point 9 PASS on boundary-touching changes.

### Point 10 — Cross-doc sync

- Test counts in CLAUDE.md match the output from Point 9?
- `docs/testing-strategy.md` updated (4-case rule from `shared/FRAMEWORK.md` Section 9)?
- All shipped plan-rows marked ✅ done in `docs/project-log.md`?

Bug log check (`docs/bug-report.md`):
- Any `open` bugs with no plan row? Either assign one or add a comment explaining the deferral.
- Any `fixed` bugs the test team hasn't re-run? Hold — do not mark release done until verified.
- Any bug this session's fix touches? Update its status (open → fixed) and add the commit reference.

### Point 11 — UX consistency

**Only run this point if `/impact` reported `UI surface: yes`.** Skip entirely for API-only, schema-only, or infra-only changes.

Check the diff for:

1. **Token compliance** — any raw hex color values, hardcoded pixel sizes for spacing/typography, or `style={{}}` attributes covering something in the token system? FAIL if found. Every color, spacing unit, and type size must use the project's token classes (Tailwind classes, CSS variables, or design-system tokens from `docs/ux-patterns.md`).

2. **Four-state completeness** — does the changed UI cover all states that can occur?
   - Loading: skeleton or spinner while data fetches
   - Empty: intentional empty state (not a blank container)
   - Error: inline error message or toast — never silent failure
   - Success: confirmation feedback (toast, state change, or navigation)
   Missing a state is a FAIL — log it, don't silently defer it.

3. **Keyboard accessibility** — every interactive element (button, link, input, modal trigger) must be reachable via Tab and activatable via Enter/Space. Modals must trap focus and close on Escape. Verify by reading the JSX — a `div` with an `onClick` and no `role="button"` + `tabIndex={0}` + `onKeyDown` is unreachable from the keyboard.

4. **Focus ring** — does the focused element show a visible focus indicator? Tailwind's `focus:ring-*` or `focus-visible:ring-*` must be on every interactive element. `outline: none` without a replacement ring is a FAIL.

5. **Reuse check** — does the new UI introduce a pattern that already exists in `docs/ux-patterns.md`? (A new custom modal when the shared Dialog is already approved; a one-off toast instead of `sonner`.) If a new pattern was intentionally introduced, was `docs/ux-patterns.md` updated to document it? New pattern without a doc update = FAIL.

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
Point 11 UX consistency:   PASS / FAIL / N/A — [reason or "no UI surface"]

Items to fix:
- [list of FAILs with specific files/lines]
```

Fix all FAILs, then run `/audit` again until the audit is fully clean.
