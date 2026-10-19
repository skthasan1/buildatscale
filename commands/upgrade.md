# /upgrade — Upgrade Build@Scale with AI

Detect your installed version, show what changed since then, auto-update skill files.

## When to run

Run this after pulling the latest framework:
```bash
git -C shared pull   # fetch latest from github.com/skthasan1/buildatscale
/upgrade             # detect delta, apply updates, show breaking changes
```

## What this skill does

### 1. Detect installed version

Read `.claude/buildatscale-version` to find the version you have installed.

If the file doesn't exist, you're on a pre-versioning install (before v2.1.0).
Treat that as `2.0.0` and show all 2.1.0+ changelog entries.

### 2. Read available version

Read `shared/VERSION` to find the version you just pulled.

If `shared/VERSION` doesn't exist, the framework hasn't been pulled yet.
Tell the user to run `git -C shared pull` first and stop.

### 3. Compare

- If versions are the same → "Already up to date (v{version}). Nothing to do."
- If `shared/VERSION` is older than `.claude/buildatscale-version` → warn: "The shared/
  folder appears to be older than your installed version. Did you mean to run
  `git -C shared pull` first?"
- If `shared/VERSION` is newer → proceed.

### 4. Show the changelog delta

Read `shared/CHANGELOG.md`. Extract all entries from your installed version
(exclusive) up to and including the new version (inclusive).

Display them clearly:
```
Upgrading v2.0.0 → v2.1.0

Changes in this upgrade:
───────────────────────
[2.1.0]
  Added: Stack detection in /pipeline
  Added: TEST_CMD variable in /build, /audit, /wrap
  Added: ci/github-actions.yml starter CI
  Changed: /impact stack-specific additions now opt-in
  Fixed: PLAYBOOK.md 7-step → 8-step references

Breaking Changes: none
```

If there are **Breaking Changes** entries, highlight them prominently and list
the manual steps required before applying the update.

### 5. Auto-update skill files

Copy all updated skill files from `shared/commands/` to `.claude/commands/`:
```
cp shared/commands/*.md .claude/commands/
```

Report which files changed:
```
✅ Skills updated:
   .claude/commands/pipeline.md  (changed)
   .claude/commands/impact.md    (changed)
   .claude/commands/build.md     (changed)
   .claude/commands/audit.md     (changed)
   .claude/commands/wrap.md      (changed)
   .claude/commands/design.md    (unchanged)
   .claude/commands/docsup.md    (unchanged)
   .claude/commands/mft.md       (unchanged)
```

### 6. Handle settings-template.json changes

If `shared/settings-template.json` differs from `.claude/settings.json`:
- Show the additions/changes in the template
- Ask: "Do you want to apply these settings changes to .claude/settings.json?
  (Your existing custom rules will be preserved.)"
- If yes: merge new `allow` entries into `.claude/settings.json` without removing
  any rules the user has added. Never remove existing entries.
- If no: skip, but note which new permissions they're missing.

### 7. Handle new files (e.g. ci/)

If new directories or files exist in `shared/` that don't exist in the project:
- List them: "New in this version: shared/ci/github-actions.yml"
- Ask: "Copy to your project? (y/n)"

### 7b. Project mode (introduced in v2.14.0)

Runs when the upgrade crosses v2.14.0 (installed version < 2.14.0 ≤ new version). Skip otherwise.

1. Read the `project-mode` block in CLAUDE.md. **Never rewrite existing ids** — old `BUG-NNN` / `V-NNN` entries, commits and docs stay exactly as they are, in both modes.
2. **Block missing** → the project is `solo` and behaves exactly as before. Ask once:
   "Do several people (or parallel Claude sessions on different branches) log bugs in this project? If yes I'll set `mode: multi` (new bug ids become `<github-handle>-NNN`, one list per person). Otherwise nothing changes."
   - **No / unsure** → do nothing. (Don't add the block; missing = solo.)
   - **Yes** → add the `project-mode` block with `mode: multi` to CLAUDE.md (next to `## Contributors`), then do step 4.
3. **Block present** → report the mode; if `multi`, do step 4.
4. **One-time check (multi only):** `docs/bug-report.md` must contain a `## List —` header. If it has none, warn — do not edit the file without asking:
   ```
   ⚠ Multi mode, but docs/bug-report.md has no per-person list header.
     Proposed: put existing entries under "## List — legacy (BUG-NNN)" and add
     "## List — <your-handle>" for new ones. Old ids are not renamed. Apply? (y/n)
   ```
5. Mention in the summary: "Behaviour for solo projects is unchanged in v2.14.0."

### 8. Update the installed version

Write the new version to `.claude/buildatscale-version`:
```
[new version]
```

### 9. Summary + follow-up audit

```
✅ Upgrade complete: v2.0.0 → v2.1.0

Skills updated: 5 files
Settings: merged 3 new allow rules
New files: ci/github-actions.yml (copied)

No breaking changes — no manual steps required.
```

Then always prompt:

```
Next step: run /audit on your project.

New framework rules may flag gaps in your existing code or docs that
weren't caught under the old version. This is the only way to know if
anything needs fixing — the upgrade applies the new rules but doesn't
check whether your project already meets them.

Run: /audit
```

This is not optional. An upgrade that applies new rules without checking
compliance is incomplete. The audit is the second half of the upgrade.

---

## Version mismatch warning

Add this check to any skill: if `.claude/buildatscale-version` is older than
`shared/VERSION`, print a soft warning at the top:

```
⚠ Framework update available: v2.0.0 → v2.1.0
  Run: git -C shared pull && /upgrade
```

This surfaces naturally when Claude uses any skill — users don't have to remember
to check for updates.
