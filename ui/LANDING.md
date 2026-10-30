# Landing and marketing pages

Generic lessons from several marketing sites that went through repeated review passes. Typical verdicts and what they led to:

| Verdict | What it led to |
|---|---|
| "looks generated" | A restrained pass |
| "too bland and flat" | An atmosphere layer on top of the system |
| "too many cards, still static" | Cards removed |
| "too clunky, not premium" | Studying best-in-class product pages |
| "still cheap and not cohesive" | One material system |
| "too much content, less scroll" | Sections cut |

Contents: 1 Structure · 2 Type · 3 Material and atmosphere · 4 Motion · 5 Copy and claims · 6 Performance and security · 7 Checklist

## 1. Structure

- **Few scenes, each with a point no other carries.** Four to six including the hero (the footer is excluded). Add a section only if it carries a point none of the others do, and add nothing to home that the product page already says.
- **Two pages for SaaS:** a short home, plus a product page holding the detailed sections, an "On this page" list and a progress rail.
- **Cut:** FAQ, statement and manifesto sections, duplicate demos, teaser grids, trust walls, and claims nobody can check.
- **Show the real product working in the hero.** A faithful reproduction of the app's UI, never an invented screen. Demo people are fictional and named consistently.
- **Rhythm from changing the ground, not from padding.** Dark bands open with a hairline and fade into the next ground; no band shows a hard bottom edge. A long page with no inversion reads flat however good the typography. Centralise section padding in one `Section` component, because uneven padding gives the scroll a limp nobody can point at. Giant identical padding everywhere is itself a tell.
- **Section heads:** a rule-based head (index on the left, label on the right, a self-drawing rule). Avoid identical centred heads over left-aligned content.
- **No uniform card grids.** Use a bento layout, ledger rows, or one glass pane with hairline columns. For pricing, one panel with the plans as columns and the recommended plan as an accent inset beat three separate cards.
- **Nav:** a floating glass pill that hides on scroll down. **Footer:** a deeper ground, optionally an oversized cut-off wordmark fading to nothing.
- **People:** ringed circular portraits only, six at most. No stickers, crowds or bobbing; scattered stickers read as a toy.

## 2. Type

- **One display face:** a sans tracked -0.03 to -0.035em at line-height 1.0 to 1.05, weight 600, or a true display serif at weight 400 (never synthesise a fake bold).
- **Sizes:** hero 72 to 124px (`clamp(3.4rem, 8.6vw, 7.75rem)`); scene titles 48 to 68px; product section titles about 46px; lede 17 to 18px and one sentence; body 15 to 16px; mono eyebrows 11 to 11.5px, 0.08em, uppercase.
- **An italic accent phrase appears at most twice** (hero and closing), never on every title.
- **Gradient or foil text appears once per site.**
- **Line breaks are placed by the writer.** `text-balance` on heads, `ch` measures on copy.
- Keep text inside illustrations at 12px or more (Lighthouse counts it).

## 3. Material and atmosphere

- **One material system for the whole page.** The usual "cheap, not cohesive" diagnosis is five visual languages at once (emoji faces, serif paper, cursive, flat cards, candy gradient). The fix is one ground, one ink, one accent and one glass, everywhere.
- **Atmosphere sits on top of a disciplined layout, never in place of it.** Recipes that survive review:
  - Film grain: a fixed SVG fractal-noise layer at opacity about .05 with an overlay blend; hidden under reduced motion.
  - Light pools: radial gradients with eased stops, never `blur()`. Mask them out before any edge, or the glow shows as a rounded box. Pause off screen.
  - A CSS-only living sky: five pools on slow closed orbits (38 to 58s) with a pause button. A WebGL version tends to read as busy marbling.
  - Dot grids at low alpha; a pointer-following light on dark bands.
  - Glass frames with a lit top edge, over a deliberate wash.
- **Usually removed after trying:** floating glass cards around the hero demo, an intro curtain, a marquee on the home page, tilt cards everywhere, WebGL glass.
- **Shadows:** a warm near shadow plus a cool far shadow on light. On dark, use coloured light, not black drop shadows.
- **Never pure #000 grounds.** Use #07070b to #0e0f12 on dark, or a warm paper on light.

## 4. Motion

- **Libraries:** one animation library plus smooth scrolling (off under reduced motion), or no library and one rAF loop writing CSS variables.
- **One ease**, springs only for things that land. See [MOTION.md](MOTION.md).
- **Reveals** fire once with a -12% bottom margin: 0.7 to 1s, a 12 to 18px rise, an optional 8px blur on marketing only. Line reveals rise from behind their baseline. Rules draw with `scaleX`.
- **Scroll-lit words:** body copy lights word by word as it scrolls. Both ends of the ramp pass 4.5:1. A step still to come is set quieter, never fainter; dimming with opacity fails the contrast audit.
- **Pinned stories:** 240 to 420vh tracks with overlapping stage windows. Below `lg`, the same DOM runs a timed loop.
- **Image reveal:** a clip-path wipe over about 1.1s with the image scaling down from 1.06.
- **Rules:** nothing fades text in a loop; everything stops off screen; reduced motion shows the finished story; nothing invisible stays clickable.

## 5. Copy and claims

- Short declaratives with full stops, built on the brand's own verb. Sentence case. See [COPY.md](COPY.md).
- **Claims are sourced** from the product's code or supplied by the owner. When the owner removes a claim block, it stays out.
- **Numbers as type, not decoration.** Serif figures, not gold circles.

## 6. Performance and security

- **The first paint needs no JS:** a CSS hero entrance, the LCP lede painted dim (opacity .35) from frame one, reveals that degrade to visible.
- **Heavy media:** `preload="none"` video with a poster, paused under reduced motion; at most two concurrent decoders; short clips at about 640px; lazy WebGL or slider renderers in a reserved-height frame with a still poster first.
- **Fonts:** load mono and script faces with `preload: false`; drop unused variable axes.
- **Targets:** Lighthouse desktop 98 to 100, mobile 85 or more, accessibility and best practices 100.
- **Security:** a per-request nonce CSP; headers set in the framework config. Check how the framework's CSS inlining option interacts with the nonce before enabling it (an inlined style without the nonce is blocked and all CSS disappears).
- Unlayered custom CSS beats Tailwind utilities, so put component classes in `@layer components`.

## 7. Checklist before showing a landing page

- [ ] Four to six scenes, each with a unique point. Page height measured and reported.
- [ ] One accent, one material; gradient text once; an italic accent at most twice.
- [ ] The hero shows the real product, not an invented screen.
- [ ] No uniform card grids, stat tiles, pulsing eyebrow pills, stickers or floating cards.
- [ ] Bands fade into each other; no hard band edges; no dead-black middle.
- [ ] First paint works without JS; reduced motion shows the finished state; everything pauses off screen; anything that moves on its own has a pause control.
- [ ] Layered stages are `pointer-events-none` or `inert` where hidden, and a probe really clicks the CTAs.
- [ ] Lighthouse run; contrast computed; widths 1440 and 390 in each theme the site ships (a site that is single-theme by design stays single-theme).
- [ ] Copy in sentence case, every claim sourced.
