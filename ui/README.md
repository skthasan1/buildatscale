# UI house style

A default UI/UX method for every Build@Scale project that has a UI surface (web, desktop, mobile, marketing site). It records what tends to separate interfaces that look designed from interfaces that look generated, and how to prove a UI change instead of assuming it.

**It is a default, not a law.** A project may override any rule here by writing the override and its reason in its own `docs/ux-patterns.md`. See FRAMEWORK.md section 5, "UI house style", for the precedence order. Team process rules (size caps, review rules, locked decisions) always bind.

It is not a theme. It ships no colours, fonts or logos. Each project keeps its own identity; what carries over is the way decisions are made.

## Files and when to read them

| File | Read it when |
|---|---|
| [PRINCIPLES.md](PRINCIPLES.md) | Always, for any UI task. Ten principles, the "cheap / generated" tells, how to read terse design feedback, the workflow, how the pipeline steps use it. |
| [VERIFICATION.md](VERIFICATION.md) | Before calling UI work done, and in `/audit` Point 11 and `/mft`. Gate, sizes, contrast, probes, taste-guard tests, performance proof, traps. |
| [MOTION.md](MOTION.md) | Any animation, transition, loop, scroll scene or performance question. |
| [COPY.md](COPY.md) | Any on-screen words: labels, empty states, errors, headlines. |
| [MOBILE.md](MOBILE.md) | React Native / Expo, or porting a web pattern to native. |
| [LANDING.md](LANDING.md) | Marketing and landing pages. |
| [templates/ux-patterns.md](templates/ux-patterns.md) | Creating a project's `docs/ux-patterns.md` (de-branded, placeholders, defaults only). |
| [scripts/contrast.mjs](scripts/contrast.mjs) | Computing WCAG contrast for colour pairs or a stylesheet's tokens. Exits 1 on a miss. Top-level blocks only; `--media` reads a dark theme nested in `@media`. Test: `node --test shared/ui/scripts/contrast.test.mjs`. |

## How a project uses it

The pipeline commands reference this folder as `shared/ui/` (the same way they reference `shared/FRAMEWORK.md`). Nothing is copied into `.claude/commands/`; `/upgrade` and `/scaffold` need no file list change. A project with no UI surface never reads it.

1. Start `docs/ux-patterns.md` from `shared/ui/templates/ux-patterns.md`.
2. Run the pipeline as usual. `/impact` Q9, `/design`, `/docsup`, `/build`, `/audit` Point 11 and `/mft` each add the UI steps listed in the table in PRINCIPLES.md.
3. Record project overrides, with a reason, at the top of `docs/ux-patterns.md`.
