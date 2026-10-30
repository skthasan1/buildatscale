# Verification: gate, probes, contrast, taste guards

Ask for behavioural proof, not assumed correctness. Real bugs have surfaced only in a probe: a table clipping its last column, a dead hero CTA, a select arrow touching the edge. Report outcomes with numbers.

Contents: 1 The gate · 2 Sizes and themes · 3 Contrast · 4 Probes · 5 Taste-guard tests · 6 Audit Point 11 house additions · 7 Performance proof · 8 Traps

## 1. The gate

Run the project's own gate first, in its own order (typecheck, lint, format check if the project uses one, tests, build). Then:

1. **Both themes** at the project's acceptance sizes (section 2).
2. **Contrast computed** from the real tokens (section 3).
3. **Probes that act** (section 4).
4. **Taste-guard tests** pass (section 5).
5. The pipeline's `/audit` (with Point 11) and `/mft`.

Do not run a formatter the project does not use: it can rewrite long lines across files and bury the real diff. Follow the project's branch, PR size and review rules; commit one visible change at a time.

## 2. Sizes and themes

Define the acceptance sizes once in `docs/ux-patterns.md`. Defaults:

| Product kind | Capture |
|---|---|
| App or platform | 1440 (or 1280), 820 and 390 wide, light and dark, plus the AI or side panel open if it steals width. Fail on any sideways scroll. |
| Phone-first app | 390 and 1280, light and dark |
| Marketing site | 1440 and 390 in each theme the site ships. A site that is single-theme by design stays single-theme: do not add or capture a second theme. |

Full-page captures draw `backdrop-blur` overlays below the fold as black boxes; confirm with a viewport shot before believing it. A capture that clips and captures beyond the viewport can re-lay out sticky or full-height panels.

## 3. Contrast

Floors:
- **4.5:1** for all informative text, in every state and both themes, *including muted text and placeholders*.
- **3:1** for focus rings, icons and graphic marks. Borders may sit lower by design (a hairline system); the ring may not.

Compute, do not eyeball, with [scripts/contrast.mjs](scripts/contrast.mjs):

```bash
# pairs (foreground background ...)
node shared/ui/scripts/contrast.mjs "#0B0B0E" "#FF7A1A" "oklch(54% .1 72)" "oklch(97.6% .004 85)"
# a stylesheet's tokens, per theme (=3 sets a 3:1 floor)
node shared/ui/scripts/contrast.mjs --css src/app/globals.css --selector ":root" --selector ".dark" \
  foreground:background muted-foreground:card accent-foreground:accent ring:background=3
```

Only top-level blocks of a selector are read. If the dark theme is `@media (prefers-color-scheme: dark) { :root { ... } }`, run it twice: once as above for light, once with `--media "(prefers-color-scheme: dark)"` for dark (the nested values overlay the top-level ones).

It reads hex, `rgb()`, `hsl()`, bare HSL triplets and `oklch()`, resolving `var()` chains, and exits 1 on a miss so it can sit in a gate. It flags `color-mix()` and translucent colours as "measure the composited colour", because their ratio depends on what is under them. For those, read the rendered colour in the browser (`getComputedStyle`) and use pair mode.

Common failures on white: a light grey (zinc-400, about 2.6:1) for muted text; amber-600 (about 3.2:1) for warnings; white text on a mid-tone accent fill. Check them first.

## 4. Probes

Use headless Chrome or Edge over the DevTools protocol (CDP):

```bash
chrome --headless=new --remote-debugging-port=9222 --use-gl=angle --use-angle=swiftshader --user-data-dir=<absolute path>
```

A small scratch driver (navigate, evaluate, click, screenshot, set theme) is enough. A probe must check:

- **Clicks, not hrefs.** `document.elementFromPoint` at the control's centre must return the control (or its child). Then really click it. Layered stages, pinned scenes and overlays steal clicks.
- **Sideways scroll:** `document.scrollingElement.scrollWidth <= innerWidth` at each width.
- **Accessible names** on every control; a visible `:focus-visible` ring (2px with a 2px offset, or an inset ring inside fields); Escape closing dialogs and menus; focus returning to the trigger.
- **State in attributes:** labels stay stable and state lives in `aria-pressed`, `aria-selected` and `aria-expanded`.
- **Reduced motion:** with `Emulation.setEmulatedMedia prefers-reduced-motion: reduce`, the still state shows and nothing blocks content.
- **No runtime errors**, CSP violations or hydration warnings in the console.
- **Measured geometry** for any spacing claim: insets, centring and concentric radii, read from `getBoundingClientRect` and `getComputedStyle`.

Never press paid or destructive buttons in a probe. Close the browser through CDP `Browser.close`; some launchers hand over to another process, so killing the launcher leaks browsers.

## 5. Taste-guard tests

Encode a taste decision as a source-scanning test, so a rebase or a teammate cannot quietly undo it. Good candidates: the accent is never a fill; banned low-contrast token classes in an explicit file list; brand name and colours live in one module; every rule in a scoped stylesheet sits under its root class; concentric corners and the focus outline in component tests.

```ts
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|css)$/.test(p) ? [p] : [];
  });
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

const FILES = [...walk("components"), ...walk("app")].filter((f) => !f.includes("marketing"));

test("the scan found the code (an empty scan must not pass)", () => {
  expect(FILES.length).toBeGreaterThan(20); // set to roughly half the real count
});

test("the accent is a tint or outline, never a fill", () => {
  // Standalone token only: bg-accent/10 and bg-accent-soft are tints and pass.
  const fill = /(^|[\s"'`])(hover:|focus:)?bg-accent(?![\w/-])/;
  const hits = FILES.filter((f) => fill.test(strip(readFileSync(f, "utf8"))));
  expect(hits).toEqual([]);
});
```

Rules for these tests:
- Assert a minimum file count, so an empty scan cannot pass.
- Strip comments before scanning.
- Match whole class tokens (a whitespace or quote boundary), so `dark:text-zinc-400` does not trip a light-only rule.
- Prefer an explicit allowlist with counts to a blanket ban when a few uses are legitimate.
- Counter-factual check: temporarily add a violation and confirm the test fails.

## 6. Audit Point 11 house additions

In `/audit`, Point 11 runs the framework's five checks (tokens, four states, keyboard, focus ring, reuse) and then these ten (H1 to H10). Mark each **PASS, FAIL or N/A with file and line**. A project's written override (with a reason) in `docs/ux-patterns.md` replaces the matching default; an override without a reason is a FAIL.

H1. **Accent rationing.** The accent appears only on active, focus, AI and "yours" marks. At most one accent fill per view, and no fill at all where the project makes the brand outline-only. Status colours carry a word or icon. Outline buttons do not hover in the accent.
H2. **Boxes vs hairlines.** No card inside a card, no stat or count tiles, no uniform card grid where a list or ledger would do, no new shadow beyond the project's tiers, no glass without a wash under it.
H3. **Subtraction.** Nothing repeats information already on the page. No do-nothing control. No explainer where a control will do. No count at rest. Height is earned.
H4. **Type.** Display and work faces from the tokens. Tabular numerals on scanned figures. Uppercase only via the eyebrow utility. Headings balanced.
H5. **Geometry.** Concentric nested radii, matched insets, container queries inside the main area, shared gutters, 44px targets on phones, no sideways scroll.
H6. **Motion.** The project's ease and springs. No bounce, lift, overshoot or looping text. Static first paint. A reduced-motion still state that keeps the signal. Paused off screen. Heavy visuals lazy, and measured if they animate continuously.
H7. **Copy.** Sentence case, verb-phrase buttons, progressive busy labels, real dates, no exclamation marks, no new em dashes, one name per thing, nothing claims what is not wired.
H8. **Contrast computed.** Numbers recorded for any new text-on-surface pair, in both themes, with muted text included.
H9. **The tells list** ([PRINCIPLES.md](PRINCIPLES.md#3-the-cheap--generated-tells)) is checked, along with the project's "Removed on purpose" table.
H10. **Captures attached** at the project's sizes and themes (section 2), before and after.

Point 11 stays skipped (N/A, "no UI surface") when `/impact` reported `UI surface: no`.

## 7. Performance proof

For anything that animates continuously (canvas, video, WebGL, long CSS loops):

- Use a production build and headless Chrome or Edge over CDP.
- Measure two 10s windows (opening and settled), with 30 keystrokes 120ms apart.
- Record Event Timing p75, late frames over 25ms, long tasks over 50ms, and main-thread busy %.
- Run at 4x CPU throttle, at desktop size and at 390x844, on a quiet machine. Record the baseline without the effect.
- Marketing pages also get Lighthouse. Mobile LCP figures from a GPU-less runner can be artifacts; compare against observed FCP.

## 8. Traps that cost time

- **Git Bash on Windows:** set `MSYS_NO_PATHCONV=1` before node probe scripts (it rewrites `/route` arguments), and pass Windows paths for files.
- **PowerShell 5.1** drops a bare `--` before native arguments (`git diff X -- paths` loses its paths). Use Bash for such commands.
- **Escapes in `evaluate` templates:** `\d` and `\s` inside a template literal lose the backslash, so use `[0-9]` or double-escape. Selectors with `\:` break too; use `[class~='lg:hidden']`.
- **Over-matching selectors:** `ul li > button` also matches sibling action buttons (use `:first-child`); `a[href^="/reports/"]` also matches `/reports/{id}/download`; `textContent` has no space between adjacent spans.
- **Menu libraries** that open on pointerdown need real pointer events in a probe.
- **A dev server left running past midnight** makes every dated page mismatch on hydration. Restart it before a gate. Run one dev server per app folder, and capture from an already-running one rather than killing it.
- **Editors saving stale tabs** can revert files mid-session. Commit soon after a run of edits. If files look older than expected, compare mtimes and ask before choosing.
- **CRLF:** `git checkout <file>` with `core.autocrlf=true` writes CRLF, so exact-match edits fail. Compare across repos with `diff --strip-trailing-cr`.
- **Framework compilers** can change whitespace around `{expr}` followed by multi-line text containing an entity such as `&amp;`. Use `{" "}` or a literal `&`.
