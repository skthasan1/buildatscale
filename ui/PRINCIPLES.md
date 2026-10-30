# UI principles, tells and workflow

The default method for any UI work in a Build@Scale project. It answers one question above all: **does this look designer-made or generated?** Most of what follows is a way to check.

Contents: 1 Precedence · 2 The ten principles · 3 The "cheap / generated" tells · 4 Reading terse design feedback · 5 Workflow · 6 Pipeline integration · 7 Starting a new product

## 1. Precedence

When sources disagree, the higher one wins:

1. **The project's own design contract and its tests** (`docs/ux-patterns.md`, the token file, taste-guard tests). Read these before touching UI.
2. **Recorded decisions** (locked decisions, the "Removed on purpose" table in `docs/ux-patterns.md`). A removed thing stays removed unless the owner asks for it back.
3. **This UI pack.**
4. **Generic UI skills or libraries**, only for what none of the above covers.

Team process rules (PR size caps, review tiers, locked decisions, commit rules) bind above all of these. Taste never overrides process.

## 2. The ten principles

Each says why, so you can apply it to cases the examples do not cover.

1. **One accent, rationed, and it always means something.** One chromatic colour. It marks the active place, keyboard focus, the AI, and "this is yours or in motion". Nothing else gets it.
   - Neutrals lean toward the accent's hue at low chroma.
   - Status colours exist only for real state and always carry a word or icon.
   - At most one accent fill per view. A project may go further and make the brand an outline and tint, never a fill.
   - Why: colour spent on decoration stops meaning anything, and fills read loud.
2. **Structure comes from type, hairlines and a surface ramp, not boxes.** A section is an eyebrow over a hairline with air below it.
   - No card inside a card; two shadows at most.
   - Glass only over a deliberate wash: glass over a flat ground is just a pale card.
   - Why: stacked boxes are the most common "cheap" verdict.
3. **Subtract until each thing earns its height.** Remove anything that repeats the page, any control that would do nothing, any count at rest, and any explainer a reader needs once (put that behind an info glyph).
   - Show the minimum at rest; reveal actions on hover or focus, keeping them in the DOM for screen readers.
   - Why: refinement passes are overwhelmingly removals.
4. **Type does the branding.** A display face (a serif, or a tightly tracked sans), a dense work face at 13 to 14px, mono for codes, IDs and timecodes.
   - Tabular numerals on anything compared or scanned.
   - Uppercase only through one eyebrow utility (11 to 11.5px, 0.08 to 0.14em tracking).
   - Line breaks are placed by the writer; `text-balance` on headings, `text-pretty` on prose.
5. **Motion settles and stops.** One ease curve, critically damped springs. Nothing bounces, lifts on hover, overshoots or repeats. First paint is static. Loops are only for live state. Reduced motion keeps a still that carries the same signal. Details in [MOTION.md](MOTION.md).
6. **Visuals and theatre tell the truth.** Charts and instruments are drawn from the page's own data, and every mark is a way in (a link or a filter).
   - Scenes narrate real work.
   - No fabricated telemetry: no invented scale claims, no false precision, no trend arrows from a dozen data points. Stubs say what is not wired.
7. **One metaphor, carried in details.** Identity comes from the product's own world (a film frame, a paper folio, an auction lot), expressed in small recurring details, not ornaments. Decoration that needs explaining has failed.
8. **Geometry is exact and measured in the browser.**
   - Nested radii are concentric (outer minus inset equals inner: 12 minus 8 gives 4px).
   - Insets match (an arrow sits as far from the edge as the text). Overlays clear frame lines.
   - Content centres on the window; every page shares the same gutters.
   - Inside an app's main area, layout answers to container queries, because side panels steal width that viewport breakpoints cannot see.
9. **Copy is calm, specific and honest.** Sentence case, verb-phrase buttons, real dates, no exclamation marks. Details in [COPY.md](COPY.md).
10. **Prove it, then guard it.** Check both themes, the required widths, computed contrast, and probes that really click and hit-test. Encode taste rules as source-scanning tests so a rebase cannot quietly undo them. Details in [VERIFICATION.md](VERIFICATION.md).

## 3. The "cheap / generated" tells

Check every design against this list before showing it.

- **Layout:** count or stat tiles and KPI box rows; uniform three-card grids; cards inside cards; a page of stacked boxes; identical section heads with the same huge padding everywhere; a centred head over left-aligned content.
- **Type:** giant serif headlines with an italic phrase on every title; Title Case marketing heads; generic claims ("Next-gen AI engine", "Empowering your workflow").
- **Ornament:** pulsing-dot eyebrow pills; icons in circular chips; numbered badge circles; hand-drawn underline flourishes; emoji stickers; floating glass cards around the hero; colour bars on cards; green and amber banners.
- **Colour:** accent fills everywhere, or two accent CTAs visible at once; outline buttons that light up like the primary on hover; multi-hue candy gradients; gradient text in more than one place; black drop shadows on a dark ground; a red count that reads as an alarm.
- **Motion and effects:** hover lifts and bounces; text that fades in a loop; shader marbling, WebGL or 3D for its own sake; a third-party demo dropped in with its default look.
- **Chrome:** full-height drawers where a compact card would do; native selects that open a grey browser list; a do-nothing button; a confirm dialog where an Undo would do.

## 4. Reading terse design feedback

Verdicts are short. This is what they usually mean and what to do. A project's own history can refine the table.

| Verdict | It usually means | Do |
|---|---|---|
| "cheap", "generated", "templated" | Generic components, boxes and tiles, several visual languages at once | Go finer, smaller, fewer and more domain-specific. Replace tiles with type and hairlines. Unify into one material system. |
| "clunky", "big" | Too much chrome or size | A compact card instead of a drawer, compact headers, smaller glyphs, less padding |
| "bland", "flat", "static" | The discipline is right but the page has no life | Add atmosphere and motion on top of the system (grain, slow light pools, scroll-driven scenes). Not more cards. |
| "not cohesive", "doesn't flow" | Mixed idioms, no through-line | One material, one accent, merged scenes, bands that fade into each other |
| "too much content", "tighter", "less scroll" | Sections that do not carry a unique point | Cut sections, one-sentence ledes, measure page height before and after |
| "should pop more but look premium" | More presence without loudness | Glow and a travelling light on an outline. Never a fill. |
| "too colourful" | Saturation in a premium element | Smoked or neutral, one low accent |
| "completely broken" (on desktop) | A phone layout stretched at 1280 | Check wide widths for every screen |
| "20% off", "30px less" | The reviewer tunes by numbers | Offer changes in measurable steps and report the numbers you used |

When a design is called cheap, do not defend it or tweak it at the margins. Name the tell from section 3 and remove it.

## 5. Workflow for any UI task

1. **Find the system.** Read the project's contract (section 1). Locate its tokens, UI kit and motion constants. Never restate a token as a raw value.
2. **Find the precedent.** Look for the closest existing pattern in `docs/ux-patterns.md` and the codebase. Reuse before inventing. If you invent, write the new pattern into the project's design doc in the same change.
3. **Check the removed list.** Do not re-propose what the owner took out.
4. **Design with the principles and the tells list**, using the product's real content and data. No placeholder text, no invented features.
5. **Show options as rendered variants, not prose.** Build two or three real variants, capture them in the same state and at the same widths, and recommend one. The owner makes the call.
6. **Build in tokens and the kit**, in both themes. For dense app pages use container queries inside the main area.
7. **Verify** with the gate in [VERIFICATION.md](VERIFICATION.md), then commit one visible change per commit, titled with what changed.

## 6. Pipeline integration

For projects with a UI surface these steps are the default. The pipeline commands carry the short form; this table is the reference.

| Step | Add this |
|---|---|
| `/impact` Q9, UI surface | The closest precedent from `docs/ux-patterns.md`, and whether the change touches an item in "Removed on purpose" |
| `/design` | Options are rendered variants with captures. The recommendation cites the principle or tell it rests on. Wait for approval as the framework requires. |
| `/docsup` | Update `docs/ux-patterns.md`. If missing, start from [templates/ux-patterns.md](templates/ux-patterns.md). Write a design note with before/after values and manual-test ids. |
| `/build` | Tokens only, the shared kit, both themes, reduced motion, 44px targets on phones |
| `/audit` Point 11 | The framework's five checks plus the ten house additions in [VERIFICATION.md](VERIFICATION.md#6-audit-point-11-house-additions), each PASS, FAIL or N/A with file and line |
| `/mft` UX scenario | Captures at the project's acceptance sizes in light and dark, a keyboard pass, and hit-tests on layered UI |

**Project overrides.** Where a project's own `docs/ux-patterns.md` differs from this pack and states a reason, the project wins and `/audit` Point 11 checks against the project's rule. An override without a written reason is a FAIL. Examples of defaults a project might override: an Undo instead of a confirmation modal for reversible actions; toasts that never colour themselves; empty states in the page's own words instead of an illustration.

## 7. Starting a new product

Pick a starting archetype, then make it the product's own. Copying an archetype wholesale gives a second copy of someone else's product, not a new one.

| Archetype | Ground | Accent | Display | Feel | Suits |
|---|---|---|---|---|---|
| Ink + one accent | Cool or warm paper, deep ink dark | One saturated hue | Tracked sans or serif | Folio, document, calm authority | Work tools, B2B |
| Paper + metallic accent + display serif | Warm paper, smoked dark | A muted metallic | True display serif at regular weight | Editorial, boutique | Consumer, luxury, commerce |
| Dark studio + outline accent | Designed dark, never pure black | One accent used as outline and tint | Tight sans, mono details | Instrument panel, frames and timecodes | Creative and media tools |

Pick the accent, the display face and the metaphor first. Write three-tier tokens (raw palette, semantic roles, component use) and `docs/ux-patterns.md` before the first screen.
