# /wrap — Step 7: Session Wrap-up

<!--
  TEST_CMD: set by /pipeline at project start, or override here.
  Default: pnpm test   |   Monorepo: pnpm -r test   |   Python: pytest   |   Rust: cargo test
-->

Close the session properly: update docs, verify test count, commit, push.
Must run at the end of every session where code was written.

## What to do

### 1. Mark plan-row done

In `docs/project-log.md`, find the in-progress plan-row and mark it:
```
[ID] ✅ done | [assigned] | [title]
```

If the chunk isn't fully done (session ended mid-chunk), leave it 🔧 in progress
and add a note: "Stopped at: [what's done]. Next: [what remains]."

### 2. Update CLAUDE.md

Make these changes to CLAUDE.md in order:

**a. Current status** — update the phase/feature description to reflect what shipped.

**b. Total tests** — run the test suite now to get the real count:
```
[TEST_CMD] 2>&1 | tail -5   # use the command confirmed at project start
```
Update the "Total tests" block with the actual number. Do not use the number from
memory or from earlier in the session — run it fresh.

**c. Session note** — prepend a new entry at the TOP of the session notes section:
```
### [YYYY-MM-DD] — [plan-row ID]: [short title]

[What shipped. Test count delta (+N new tests). Any decisions made.
Any new plan-rows filed. Any deferred items.]
```

### 3. Update testing-strategy.md

If the test count changed, update `docs/testing-strategy.md` per the 4-case rule
(Section 9 of `shared/FRAMEWORK.md`). Layer counts must match the actual test output.

### 4. Commit and push to dev

Stage changed files. Commit with a message in Conventional Commits format:
```
type(scope): short description

Types: feat | fix | chore | docs | refactor | test | perf

Co-Authored-By: Claude [model] <noreply@anthropic.com>
```

**Then push as a separate command** — never chain `git push` with `&&` after the commit.
The `ask` permission rule only fires when `git push` is the start of the command:
```bash
# ✅ Correct — push triggers the ask rule
git add ... && git commit -m "..."
git push origin dev

# ❌ Wrong — rule never matches, push goes through silently
git add ... && git commit -m "..." && git push origin dev
```

Push to `dev`. Never leave uncommitted changes at end of session.

### 5. Open PR if shipping to production

If changes are ready for production, open a PR from `dev` → `main`.  
**Never merge directly to `main`** — the PR gives a Vercel preview URL to verify first.

```bash
gh pr create \
  --base main --head dev \
  --title "release: YYYY-MM-DD — [one-line summary]" \
  --body "$(cat <<'EOF'
## Changes
- type(scope): ...

## Vercel preview
- [ ] Verified on preview URL: [paste URL]

## Tests
- [ ] Unit tests passing
- [ ] No TypeScript errors in source
EOF
)"
```

**STOP HERE.** Share the PR URL and wait for the user to review and approve.  
Do NOT merge the PR — merging is the user's action, not yours.  
Only proceed if the user explicitly says to merge (e.g. "merge it", "go ahead and merge").

### 6. After merge — return to dev

Once the user merges the PR, switch back to `dev` immediately:

```bash
git checkout dev
git pull origin dev
```

PRs must be merged with a **merge commit** (not squash) so `dev` stays intact and the full history is preserved.
Never start the next session's work on `main`. Verify you are on `dev` before writing any code.

### 6. Confirm

```
✅ Session wrap-up complete:
   - Plan-row [ID] marked ✅ done
   - CLAUDE.md updated (status, [N] tests, session note)
   - Committed: [commit hash]
   - Pushed: dev
   - PR opened: [URL] (if shipping to prod) — awaiting user approval
   - Active branch: dev (confirmed)
   
Session closed.
```

## If interrupted mid-session

If the session must end before all 8 steps are complete:
1. Do NOT mark the plan-row done
2. Add a "STOPPED HERE" note to the session note in CLAUDE.md:
   ```
   STOPPED HERE — [what's done, what remains, known failures]
   ```
3. Commit whatever is stable (with "WIP:" prefix in the commit message)
4. Push

The next session starts by reading that note — no archaeology needed.
