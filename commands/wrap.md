# /wrap — Step 7: Session Wrap-up

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
pnpm test 2>&1 | tail -5
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

### 4. Commit and push

Stage changed files. Commit with a message in the format:
```
[plan-row ID] [short description]

Co-Authored-By: Claude [model] <noreply@anthropic.com>
```

Push to the current branch. Never leave uncommitted changes at end of session.

### 5. Confirm

```
✅ Session wrap-up complete:
   - Plan-row [ID] marked ✅ done
   - CLAUDE.md updated (status, [N] tests, session note)
   - Committed: [commit hash]
   - Pushed: [branch name]
   
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
