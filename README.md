# Build@Scale with AI

### The production-ready AI development framework. For everyone.

> Built by Siva Kannathasan — 20 years of product engineering, distilled into skills your AI agent follows automatically.

---

Vibe coding is great at getting you to a working demo fast. The problem hits later: no tests, no documentation, no security review, no audit trail, and design decisions made by the AI without asking you. What looked like a product is actually a prototype held together with shortcuts.

**Build@Scale with AI** solves that. It gives your AI agent the same habits a senior engineer uses on every feature — before writing a single line of code. The result isn't just code that runs. It's code that scales, that you can hand to another developer, that you can still understand six months from now.

You don't need coding experience to use it. You just need Claude Code.

---

## How it works in 3 steps

### Step 1 — Add the framework to your project

Open your terminal inside your project folder and run:

```
git clone https://github.com/skthasan1/buildatscale shared
```

This downloads the framework into a `shared/` folder inside your project. That's all.

> **Don't have a project folder yet?** Create an empty folder on your desktop, open your terminal there, and run the command above.

---

### Step 2 — Paste this prompt into Claude Code

Open Claude Code in your project folder. Copy and paste this **exactly**:

```
Set up the production framework: copy shared/commands/*.md to .claude/commands/, copy shared/settings-template.json to .claude/settings.json, and copy shared/VERSION to .claude/buildatscale-version. Then read shared/FRAMEWORK.md so you understand the methodology. Confirm when done.
```

Claude will set everything up automatically. It takes about 30 seconds.

> The `buildatscale-version` file records which version you have installed. It's what the `/upgrade` command uses to show you only what changed since your install.

---

### Step 3 — Tell Claude what you want to build

Now just describe your app. For example:

> *"I want to build a subscription-based recipe app where users can save their favourite recipes and share them with friends."*

Claude will ask you a few clarifying questions, present you with design options (not just do things without asking), write the code with tests, review its own work, and tell you when something needs your decision.

**You stay in control. Claude does the engineering.**

---

## What changes

| Without this framework | With this framework |
|---|---|
| Claude starts coding immediately | Claude analyzes what the change affects before writing anything |
| You find out about design decisions after they're built | Claude presents 2–3 options and waits for your approval |
| Tests are an afterthought (or missing) | Tests are written alongside every feature, automatically |
| Documentation drifts or doesn't exist | Docs are updated before code is written, not after |
| "It works on my machine" | Every feature goes through a 10-point review before it's marked done |
| Claude asks permission for every small action | Routine checks (running tests, reading files, linting) happen automatically |
| Sessions are disconnected — Claude forgets what was built | Every session ends with a summary committed to the project so nothing is lost |

---

## What the framework gives your AI

When you install this framework, Claude follows an 8-step process for every feature it builds:

1. **Analyses impact first** — before any code, maps every file and system the change touches
2. **Presents options, not decisions** — shows you 2–3 approaches and explains the trade-offs
3. **Writes the contract before the code** — documents what the feature does before implementing it
4. **Builds tests alongside the code** — not after, not "later", alongside
5. **Reviews its own work** — 10-point checklist before declaring anything done
6. **Tests it manually** — runs through the feature like a real user would
7. **Re-reviews after fixes** — catches the new problems that fixes sometimes introduce
8. **Closes the session properly** — updates project memory so the next session picks up cleanly

None of this requires you to know how to code. You describe what you want. Claude does the engineering. You approve the direction at each step.

---

## Requirements

- [Claude Code](https://claude.ai/code) — the AI coding assistant this framework is built for
- A terminal (any terminal — Mac Terminal, Windows PowerShell, VS Code terminal)
- Git installed (`git --version` in your terminal — if it prints a version number, you have it)

That's it.

---

## Upgrading

When a new version is released, upgrading takes two commands:

```bash
# 1. Pull the latest framework
git -C shared pull

# 2. Apply the upgrade (Claude handles the rest)
/upgrade
```

`/upgrade` will:
- Show you exactly what changed since your installed version
- Auto-update the skill files in `.claude/commands/`
- Flag any breaking changes that need manual action
- Update your installed version record

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

### Add stack-specific impact analysis

Open `.claude/commands/impact.md` and add a "Stack-specific additions" section at the bottom for the patterns that matter in your codebase. For example, if you use tRPC you'd add: *"tRPC shape: does the procedure input/output change? All proxies and mocks break simultaneously."*

### Extend the audit checklist

Open `.claude/commands/audit.md` and add project-specific audit points. For regulated industries, add compliance checks. For large teams, add multi-reviewer requirements.

### Run individual pipeline steps

Instead of `/pipeline` (guided), run individual steps:

| Command | When to use |
|---|---|
| `/impact` | Before any change — maps blast radius |
| `/design` | When you want options before committing |
| `/docsup` | Update docs before coding |
| `/build` | Implement + auto-tests |
| `/audit` | 10-point review of current changes |
| `/mft` | Claude runs your manual test scripts |
| `/wrap` | Close session: update docs, commit, push |

### What's in the shared/ folder

| File | Purpose |
|---|---|
| `FRAMEWORK.md` | Full methodology reference — pipeline, impact analysis, audit checklist, testing pyramid, branching, release, common gotchas |
| `PLAYBOOK.md` | Project startup guide — from blank idea to first feature, step by step |
| `CHANGELOG.md` | Full version history with breaking changes clearly marked |
| `VERSION` | Current version string — copied to `.claude/buildatscale-version` on install |
| `commands/*.md` | Source for all 9 slash commands — copy to `.claude/commands/` to activate |
| `settings-template.json` | Default permission allowlist — stops Claude prompting for read-only ops |
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

**Build@Scale with AI** is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — use it, adapt it, build products with it, share it with your team. Keep the attribution: *"Build@Scale with AI by Siva Kannathasan"*.
