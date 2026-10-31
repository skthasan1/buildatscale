# Build@Scale with AI

### Production-ready AI development. For everyone.

> Built by Siva Kannathasan: 20 years of product engineering, distilled into skills your AI agent follows automatically.

---

## The problem

Vibe coding gets you a working demo fast. Then it catches up with you: no tests, no documentation, no security review, no audit trail, and design decisions the AI made without asking you. What looked like a product is a prototype held together with shortcuts.

## Who it is for

- **Founders and non-coders** building a real product with an AI agent.
- **Developers** who want a senior engineer's habits on every feature.
- **Teams** that need code another person can understand six months from now.

You do not need coding experience. You need Claude Code.

## What it does

It gives your AI agent the habits of a senior engineer, on every feature, before it writes a line of code:

1. **Analyses impact first.** Maps every file and system the change touches.
2. **Presents options, not decisions.** Two or three approaches with the trade-offs, then waits for your approval.
3. **Writes the contract before the code.** Docs are updated first.
4. **Builds tests alongside the code.** Not after, not later.
5. **Reviews its own work.** A 10-point checklist before anything is called done.
6. **Tests it manually,** like a real user would.
7. **Re-reviews after fixes,** to catch what the fixes broke.
8. **Closes the session properly.** Project memory is updated so the next session picks up cleanly.

You describe what you want. Claude does the engineering. You approve the direction at each step.

## Set it up in 3 steps

**1. Add the framework to your project.** In a terminal inside your project folder (an empty folder works for a new project):

```
git clone https://github.com/skthasan1/buildatscale shared
```

**2. Paste this into Claude Code,** exactly:

```
Set up the production framework: copy shared/commands/*.md to .claude/commands/, copy shared/settings-template.json to .claude/settings.json, and copy shared/VERSION to .claude/buildatscale-version. Then read shared/FRAMEWORK.md so you understand the methodology. After setup: run a full gap analysis — compare the current project state against the FRAMEWORK.md Session 0 checklist — then build everything missing (CLAUDE.md, Tier 1 docs, test baseline, plan-rows) before starting any feature work. Report what was built.
```

Claude sets everything up and builds what is missing. It takes two to five minutes.

**3. Tell Claude what you want to build.** For example: *"I want a subscription recipe app where users save recipes and share them with friends."* It asks a few questions, shows you options, builds with tests, reviews its own work and tells you when it needs your decision.

## What changes

| Without this framework | With this framework |
|---|---|
| Claude starts coding immediately | Claude analyses what the change affects first |
| You learn about design decisions after they are built | Claude presents options and waits for your approval |
| Tests are an afterthought | Tests are written with every feature |
| Documentation drifts or does not exist | Docs are updated before the code |
| "It works on my machine" | Every feature passes a 10-point review |
| Claude asks permission for every small action | Routine checks (tests, reading, linting) run automatically |
| Sessions are disconnected | Every session ends with a committed summary |

## Running several AI agents?

Add **[Build@Scale AI Dev Team](https://github.com/skthasan1/bas_aidevteam)**: roles, a GitHub protocol and small tools for running a team of AI workers across projects, with people deciding. It needs this framework in every project.

---

## Requirements

- [Claude Code](https://claude.ai/code) — the AI coding assistant this framework is built for
- A terminal (any terminal — Mac Terminal, Windows PowerShell, VS Code terminal)
- Git installed (`git --version` in your terminal — if it prints a version number, you have it)

That's it.

---

## Upgrading

When a new version is released, upgrading takes **three steps**:

```bash
# 1. Pull the latest framework
git -C shared pull

# 2. Apply the upgrade (Claude handles the rest)
/upgrade

# 3. Audit your project against the new rules  ← do not skip
/audit
```

`/upgrade` applies the new framework rules to your skill files and settings.
`/audit` checks whether your **existing project** already meets those rules.

Without the audit, you know the rules changed but not whether your project
is compliant. New framework versions often tighten rules around docs, tests,
or edge cases — the audit is how you find out if anything needs fixing.

`/upgrade` will:
- Show you exactly what changed since your installed version
- Auto-update the skill files in `.claude/commands/`
- Flag any breaking changes that need manual action
- Update your installed version record
- Explain the UI house style (v2.16.0) and offer a `Project overrides` section in `docs/ux-patterns.md`; nothing is overwritten
- Offer to set `project-mode` (solo / multi) when crossing v2.14.0 — existing ids are never rewritten
- Prompt you to run `/audit` when done

You can always check what version you have installed:
```bash
cat .claude/buildatscale-version
```

And what's available in your local copy:
```bash
cat shared/VERSION
```

To see full release history and what's coming: [github.com/skthasan1/buildatscale/releases](https://github.com/skthasan1/buildatscale/releases)

---

## Frequently asked questions

**Does this work for any type of app?**
Yes. Web apps, mobile apps, desktop apps, APIs. The framework is not tied to any technology stack. Claude adapts the process to whatever you're building.

**I'm not technical. Will I understand what Claude is doing?**
That's the point. Claude explains every decision in plain language and waits for your approval before proceeding. You don't need to read the code — you review the intent.

**What if I already have a project in progress?**
It still works. Claude will analyse your existing codebase and apply the framework going forward. See the [retrofit guide](PLAYBOOK.md) for the exact steps.

**Does this work with other AI tools (Cursor, Copilot, etc.)?**
The skills are designed for Claude Code. The methodology in FRAMEWORK.md applies to any AI coding tool — you'd need to adapt the slash commands manually.

**Is this free?**
Yes. Licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — free to use, adapt, and share as long as you keep the attribution.

---

## For Savvy Developers

Everything above works without touching a config file. If you want to go deeper:

### Adapt to your tech stack

The framework ships with pnpm + TypeScript defaults. After install, open `.claude/settings.json` and add your stack's commands to the `allow` list:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test*)",
      "Bash(cargo test*)",
      "Bash(pytest*)",
      "Bash(go test*)"
    ]
  }
}
```

> **Windows / PowerShell:** On Windows, Claude Code uses the `PowerShell` tool, not `Bash`.
> A `Bash(...)` rule does **not** match a `PowerShell(...)` call — and vice versa. This matters
> most for the `ask` list: if `git push` guards are `Bash`-only, they are silently bypassed when
> Claude runs the command through PowerShell. Always add both variants for any `ask` rule:
> ```json
> "Bash(git push origin main*)",
> "PowerShell(git push origin main*)"
> ```
> The `shared/settings-template.json` ships both variants for every rule.

### Add stack-specific impact analysis

Open `.claude/commands/impact.md` and add a "Stack-specific additions" section at the bottom for the patterns that matter in your codebase. For example, if you use tRPC you'd add: *"tRPC shape: does the procedure input/output change? All proxies and mocks break simultaneously."*

### Extend the audit checklist

Open `.claude/commands/audit.md` and add project-specific audit points. For regulated industries, add compliance checks. For large teams, add multi-reviewer requirements.

### Session type map — which skills to use when

Three types of sessions, each with its own closing skill:

| Session type | Trigger | Skills | Closes with |
|---|---|---|---|
| **New project** | Starting from scratch | `/scaffold` → (calls `/foundation`) | `/wrap` |
| **Infrastructure** | Adding CI, env vars, docs, wiring | `/foundation` | `/wrap` |
| **Feature work** | Building any plan-row | `/pipeline` (runs all 8 steps) | `/wrap` (built into pipeline) |
| **Upgrade** | New framework version released | `git -C shared pull` → `/upgrade` → `/audit` | `/wrap` |

### Run individual pipeline steps

Instead of `/pipeline` (guided), run individual steps:

| Command | When to use |
|---|---|
| `/scaffold` | Starting a brand-new project — gathers requirements, makes architecture decisions, scaffolds the repo |
| `/foundation` | After any infrastructure session — 9-point checklist (env, gitignore, CI, docs, tests, wiring) |
| `/impact` | Before any feature change — maps blast radius |
| `/design` | When you want 2–3 options before committing |
| `/docsup` | Update docs before coding |
| `/build` | Implement + auto-tests |
| `/audit` | 10-point review after building a feature |
| `/mft` | Claude runs your manual test scripts |
| `/wrap` | Close session: update docs, commit, push |
| `/upgrade` | Apply a new framework version |

### What's in the shared/ folder

| File | Purpose |
|---|---|
| `FRAMEWORK.md` | Full methodology reference — pipeline, impact analysis, audit checklist, testing pyramid, branching, release, common gotchas |
| `PLAYBOOK.md` | Project startup guide — from blank idea to first feature, step by step |
| `CHANGELOG.md` | Full version history with breaking changes clearly marked |
| `VERSION` | Current version string — copied to `.claude/buildatscale-version` on install |
| `commands/*.md` | Source for all 11 slash commands — copy to `.claude/commands/` to activate |
| `settings-template.json` | Default permission allowlist — stops Claude prompting for read-only ops |
| `ui/` | UI house style — default for projects with a UI surface, overridable per project: principles, motion, copy, mobile, landing, verification gate, `docs/ux-patterns.md` template and a contrast checker. Start at `ui/README.md`. Read in place; nothing to copy. |
| `ci/github-actions.yml` | Starter CI — typecheck + lint + tests + build + secrets guard. Copy to `.github/workflows/ci.yml` and customise the marked sections. |

### Keep the methodology, swap the tools

The full methodology lives in `shared/FRAMEWORK.md`. It's stack-agnostic and has been battle-tested across a full production product build. Read it to understand why each rule exists — every one was added because something broke without it.

### Team setup

When multiple developers use this on the same project:
- `shared/` and `.claude/settings.json` are committed — every developer gets the same rules
- `.claude/settings.local.json` is gitignored — personal overrides stay local
- `~/.claude/settings.json` is per-machine — global preferences that apply to all projects

---

## Author

**Siva Kannathasan** — Product Engineer · [i2ltech.com](https://i2ltech.com) · siva.kann@i2ltech.com

**Build@Scale with AI** was distilled from building [VYBEV](https://vybev.app), a production ambient art platform, using Claude Code from the ground up — 30+ development sessions, 850+ tests, full CI/CD pipeline, desktop client, and multi-platform architecture. Every rule in FRAMEWORK.md exists because something went wrong when it wasn't followed.

---

## License

**Build@Scale with AI** is licensed under [CC BY 4.0](LICENSE) — use it, adapt it, build products with it, share it with your team. Keep the attribution: *"Build@Scale with AI by Siva Kannathasan"*.
