# [Product name] - UX Patterns

<!--
  Build@Scale docs/ux-patterns.md, pre-filled with the framework's UI house-style defaults (shared/ui/).
  Keep the section names (FRAMEWORK.md section 5) so /audit Point 11 and /mft find what they expect.
  Replace every [PLACEHOLDER], delete what the product does not use, and keep "Removed on purpose" current.
  Any rule below may be overridden: change it here and write the reason in "Project overrides".
-->

> Single source of truth for visual and interaction consistency.
> Reference this before building any UI. Check against it during /audit Point 11.

**Archetype:** [Ink + one accent | Paper + metallic accent + display serif | Dark studio + outline accent | own]
**Metaphor:** [the product's own world, e.g. film frame, paper folio, auction lot], expressed in [frames / paper / lot numbers...]

---

## Project overrides

Defaults from `shared/ui/` that this project deliberately does not follow. An override without a reason fails /audit Point 11.

| Default | Override | Reason |
|---|---|---|
| [e.g. no em dashes in copy] | [em dashes allowed] | [brand voice] |

---

## Color tokens

Tokens live in `[src/app/globals.css]` as [HSL triplets | OKLCH | hex]. Brand values live in one module, `[lib/brand.ts]`.

| Token | Use | Light | Dark |
|---|---|---|---|
| background | Page ground | [warm or cool paper] | [designed dark, never #000] |
| foreground | Body text | [ink] | [paper] |
| card / popover | Surfaces in the ramp: sidebar, background, band, card, popover | | |
| muted / muted-foreground | Recessed fills / secondary text (at least 4.5:1) | | |
| primary | The default primary action | | |
| accent | The one chromatic colour: active, focus, AI, "yours" | [accent] | [lifted accent] |
| accent-foreground | Text on an accent fill | [white if at least 4.5:1, else ink] | [ink] |
| border / input | Hairlines (may be about 1.3:1) / field edges | | |
| ring | Focus (at least 3:1) | = accent | = accent |
| destructive / warning / success | Genuine state only, always with a word or icon | | |

Rules:
- One chromatic accent. Neutrals lean toward its hue at low chroma. At most one accent fill per view [or: the brand is an outline, never a fill].
- Never use raw hex in component code. Use the token classes or variables. The only exception: [none | e.g. an editor's formatting palette].
- Dark is designed, not inverted. Explicit dark blocks only for [glass, glows, special surfaces].

Contrast: computed with `node shared/ui/scripts/contrast.mjs --css [path] --selector ":root" --selector ".dark" ...`; results recorded in [doc].

---

## Typography scale

| Role | Style | Class |
|---|---|---|
| Display / page title | [serif or tracked sans], 24 to 28px semibold, balanced | `[text-display text-2xl font-semibold text-balance]` |
| Hero figure | 44px, leading-none, -0.03em | `[text-[2.75rem] leading-none tracking-[-0.03em]]` |
| Card title | 15 to 16px, two lines at most | |
| Body | 14px | `text-sm` |
| Dense body (rows, chat) | 13 to 13.5px, relaxed | `[text-[13px] leading-relaxed]` (a named role, so Point 11 accepts it) |
| Metadata | 12px, muted | `text-xs text-muted-foreground` |
| Eyebrow | 11px/16px, 500, 0.09em, uppercase; the only uppercase | `text-eyebrow` |
| Mono | codes, IDs, timecodes | `font-mono` |

Weights are 500 and 600 only. `data-tabular` goes on every count, date, price, timecode and "n of m". Custom type utilities are registered in the class-merge group `[name]`.

---

## Spacing & layout

- App container: `[max-w-[1440px] px-6 py-8 lg:px-10]`, the same on every nav page.
- Shell: sidebar [264px], rail [64px], topbar [56px], side panel [`clamp(360px,20vw,520px)`].
- Rhythm: sections `space-y-6`, grids `gap-4`, cards `p-5`, forms `space-y-5` with `h-10` controls (`h-11` on phones).
- **Container queries inside the main area** (`@xl` to `@5xl`); viewport prefixes for the shell only.
- Radii tiers: controls [7px], inputs [8px], cards [12px], composer and dialogs [16px], pills full. Nested radii are concentric (inner = outer - inset).
- Shadows: `[shadow-subtle]` and `[shadow-panel]` only.
- Hairlines over boxes: a section is an eyebrow plus `border-b pb-3`. No card inside a card.

---

## Component inventory

| Component | File | Approved usage |
|---|---|---|
| Button (primary, outline, ghost) | `[src/components/ui/button.tsx]` | All actions. Outline and ghost never hover in the accent. |
| Dialog | `[.../dialog.tsx]` | Irreversible or paid steps, and forms. Solid surface, never glass. |
| Toast | `[.../toast.tsx]` | One voice; never coloured; may carry one action ("View", "Undo") |
| Pill / PillSelect | `[.../filter-pill.tsx]` | Filters; the first option is the neutral answer |
| Tabs / Segmented / FilterTabs | `[...]` | Tabs switch which list; Segmented switches how one list is drawn; toggles filter (`aria-pressed`) |
| SelectMenu | `[.../select-menu.tsx]` | Every select; never a native `<select>` on styled pages |
| EmptyState | `[.../empty-state.tsx]` | Dashed panel, one line in the page's words, an optional action |
| Figures | `[.../figures.tsx]` | How the product shows numbers; never count tiles |
| [Instrument family] | `[.../instruments/]` | At most one per page, drawn from the page's data, every mark a way in |
| [Composer / AI chip] | `[...]` | The AI's single identity mark |

Before building a new component, check this list. Reuse before inventing. A new pattern gets a row here in the same change.

---

## Approved patterns

### Empty state
- A dashed surface, centred, with the page's own words: what is missing and the one next step.
- No illustration or mascot.

### Loading state
- A skeleton in the shape of the content. A progressive busy label ("Saving...") with no spinner beside it.
- A "still working" loop is the one allowed repeat.
- Never silent.

### Error state
- Inline and plain, saying how to recover: "That didn't send. Try again in a moment."
- A dead token link never says why.

### Confirmation and undo
- **Reversible actions use an in-place Undo** (6 to 7s), not a dialog.
- A confirmation dialog is only for irreversible or paid steps. Its title states the action ("Delete project?"), its body the consequence, and the destructive button sits on the right.
- Never `window.confirm()`.

### Toast messages
- One voice, never coloured. "Added to your cart · View". Auto-dismiss in about 2.6 to 4s; errors stay until dismissed.

### Motion
- Ease `[0.16,1,0.3,1]` (or `[cubic-bezier(.22,1,.36,1)]`). Springs `SETTLE` 420/44/0.9 and `SETTLE_STIFF` 520/46/0.8. Hover 150ms, overlay 140/90ms, reveal 450ms once.
- Nothing bounces, lifts on hover, overshoots or repeats. Loops only for live state, over 2s and irregular.
- Reduced motion: a global rule, the animation library's switch, and a still state per effect.

### Copy
- Sentence case; verb-phrase buttons; no exclamation marks; no em dashes; real dates; mark the optional fields; one name per thing: [glossary].

---

## Anti-patterns

Flag these in /audit Point 11:

- Raw hex colours, palette classes outside tokens, or inline `style={{}}` for anything in the token system
- `window.confirm()`, native `<select>` on styled pages, `onClick` on a `<div>`
- Stat or count tiles, KPI box rows, cards inside cards, uniform three-card grids
- Accent fills beyond one per view [or: any brand fill], two accent CTAs visible at once, outline buttons hovering in the accent
- Status colour without a word or icon; destructive colour on a non-destroying control; red counts
- Hover lifts, bounces, looping text fades
- Icons in circular chips, pulsing-dot pills, emoji, a new icon library
- A control that does nothing; text that repeats what the page already shows
- Fabricated numbers or precision; copy that is not true where it shows

---

## Removed on purpose

Things the owner took out. Do not reintroduce without asking.

| Removed | When | Why (owner's words if given) |
|---|---|---|
| [e.g. count tiles on the dashboard] | [date] | [reason] |

---

## Responsive breakpoints

| Breakpoint | Width | Rule |
|---|---|---|
| Phone | < 640px | Single column, 44px targets, actions above tabs |
| Tablet | 640 to 1024px | Two columns |
| Desktop | > 1024px | Full layout; check 1280 for every screen |

All new UI must render at 390px (and the framework's 375px) without horizontal scroll. Acceptance captures: [1280x720 and 390x844, light and dark].
