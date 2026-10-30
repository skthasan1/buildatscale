# Copy and voice

Defaults for on-screen words. A project may override any of them in `docs/ux-patterns.md` with a reason (for example a different locale or a brand voice that needs title case).

## Rules

- **Calm, plain and specific.** "Where every project stands right now and what needs you first", not "Empowering your workflow".
- **Sentence case everywhere.** Uppercase comes only through the eyebrow utility, and eyebrows are written in sentence case and transformed by CSS. When porting strings from another product, keep its own casing verbatim.
- **No exclamation marks.**
- **Buttons are verb phrases:** "Create project", "Send invoice". Not "Submit", not "Click here".
- **Busy labels use the progressive form** ("Saving…", "Signing you in…") with no spinner beside them.
- **Mark the optional fields, not the required ones.** Never use a placeholder as a label.
- **Real dates**, derived as offsets from one clock. Relative times carry the framework's hydration-suppression attribute so server and client may differ by a minute.
- **Typography:** curly quotes and apostrophes, `…`, and `·` as the separator in meta lines and titles.
- **One name per thing**, kept consistent across screens. Keep a small glossary in `docs/ux-patterns.md` and ban the synonyms. Name a state by what is true ("Listening", not "Recording", if nothing is stored).
- **Honest UI.** Stubs say what is not wired; a fake "run" button is the one dishonest thing on the screen. No fabricated telemetry or precision ("a dozen runs do not support a percentage to two decimal places or a trend arrow").
- **No explanation sentence where a control will do.** Explainers a reader needs once go behind an info glyph.
- **Failures are plain and recoverable:** "That didn't send. Try again in a moment." A dead link never says why it is dead.
- **Screen-reader labels are sentences:** "Blue kettle, price $79, the lowest of six".
- **Copy must be true where it shows.** A line such as "Rechecking prices since you left…" appears only where it is true, not as a default.

## Dashes

Default: **no em dashes (—) in new user-facing copy** (UI text, titles, alt text, metadata, text baked into images). They read as a machine-writing tell to many reviewers. A project that disagrees records that in `docs/ux-patterns.md`.

- Rewrite rather than delete: a colon for bullets and tooltips, `·` or a hyphen in titles, sentences or brackets in prose. Empty values read as words ("None", "Never").
- En dashes in number ranges ("0–100") are fine.
- After editing copy, grep the **served HTML** for U+2014 and `&mdash;`, not only the source. Text baked into images must be re-rendered.
- In an older product that already uses em dashes, do not add new ones, and offer a sweep if you touch many strings.

## Voice

Give the product one voice and write it down in two lines: who is speaking and how long their sentences are. Examples of voices that work: a senior colleague (terse, exact, unhurried); plain declaratives built on the product's own verb; a warm, brief concierge; a director rather than a prompter.

- Mark the AI speaking with one consistent glyph, if you mark it at all.
- Warm verbs at a flat word count ("searches" becomes "combs") add voice without adding length.

## Headlines and ledes (marketing)

- Short declaratives with full stops. One-sentence ledes.
- No generic AI phrasing ("Next-gen AI engine", "Revolutionize your workflow").
- Wordplay is welcome when it is the owner's own. If a line might read as a typo, keep it as written and offer the alternative once.
- Match the project's locale and spelling throughout.
