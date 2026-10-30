# Motion

Contents: 1 Doctrine · 2 Vocabulary · 3 What may loop · 4 Scenes worth building · 5 Reduced motion · 6 Performance · 7 Platform traps

## 1. Doctrine

> Nothing bounces, nothing lifts on hover, nothing overshoots, nothing repeats. Someone who can name the animation has been shown too much.

- Things **arrive and stop**, like a weighted object.
- The first paint is static (no initial animation state), and nothing replays on back-navigation.
- Instruments, seals and signatures draw **once**, on arrival.
- Hover is colour or border. The only transform a control gets is a small press (`active:scale-[0.98]`), plus an arrow that fades in and nudges 1px.
- On marketing pages, motion is **driven by the reader's scroll**. Stages overlap (otherwise it reads as a slideshow), and nothing fades text in a loop.
- A signature moment narrates real work and earns its seconds. If the wait is the point, do not offer a skip that undoes it.

## 2. Vocabulary

Put the constants in one module (for example `src/lib/motion.ts`) and a matching CSS custom property. Do not hand-write curves per component. These are defaults; a project may pick other numbers and record them in `docs/ux-patterns.md`.

| Constant | Default | Use |
|---|---|---|
| `EASE` | `[0.16, 1, 0.3, 1]` (CSS `--ease-settle`), or `cubic-bezier(.22,1,.36,1)` | Everything |
| `SETTLE` spring | stiffness 420, damping 44, mass 0.9 (about 300ms, no overshoot) | Things that land |
| `SETTLE_STIFF` | 520 / 46 / 0.8 | Tab rule, segmented thumb, shared-layout indicators |
| `FADE` | 0.18s | |
| `rise` | y 6 to 0 over 0.32s, stagger 0.04 | List arrival |
| `--ease-glide` | `(0.65,0,0.35,1)` | Loops only |

| Event | Duration |
|---|---|
| Hover | 150ms |
| Overlay in / out | 140ms (scale .97 and a 2px lift) / 90ms ease-in |
| Scrim | 160ms in / 120ms out |
| Sheet | 260ms in / 180ms out; it travels on translateX rather than scaling |
| Page enter | 420ms, y 8; fill-mode backwards so no transform lingers |
| Reveal, app | 450ms, y 10, once, staggered by column |
| Reveal, marketing | 0.7 to 1s, 12 to 18px rise, viewport margin of -12%, once (re-animating on every pass reads as a glitch) |
| Line reveal | y 135% with a small rotate, about 1.15s, 0.085s stagger, masked by its baseline |
| Count up | 900ms on first paint, 400ms on change |
| Stagger budget | 0.04 to 0.08s per item; beyond about 0.3s total it reads as lag |

Native micro-motion (see [MOBILE.md](MOBILE.md)): a menu springs from its anchor corner (scale .94 to 1, close 160ms); a toast drops 14px and holds about 2.6s; a press sinks about 6% over 110ms then springs back; a haptic tick marks commitment.

## 3. What may loop

Only signals that mean "live" or "still working": loaders and typing dots (about 1.2s), the AI's idle presence, a recording or listening state, and ambient atmosphere on marketing pages.

- **Slow:** anything under about 2s reads as an alert. A fast marquee reads as a discount banner; use 45 to 60s.
- **Irregular:** the eye habituates to a regular loop within two cycles. Use a burst every 12s with the lap packed into the first 25%, or hold 9s and travel 3s. Layers on prime-number durations never line up.
- **Compositor-only:** transforms and opacity only.
- **Pausable:** anything that moves on its own for more than 5s needs a pause control (WCAG 2.2.2) and stops off screen and in hidden tabs.
- **Earned presence for a CTA:** a light that runs only on focus or hover (one lap in 3 to 6s), never constantly.

## 4. Scenes worth building

- **Splash or launch, once per session.** Play it once per browser session (a session cookie; `sessionStorage` is per tab, so new tabs replay it). Hide it before paint with an inline script. Hand off from the native splash with the identical mark at the same size. Exit in two steps (words first, then the ground), because a single fade double-exposes.
- **Waiting as theatre.** Give a long AI wait a minimum duration and lines held about 1.25s each, with the real results orbiting or arriving, and a progress rule that tells the reader how long is left.
- **AI presence.** A small mark tinted through `currentColor`, with moods (idle, listening, thinking, speaking). Build it in-house; a dropped-in third-party shader looks like one.
- **Pinned scroll story.** A 240 to 420vh track with progress mapped to overlapping stage windows. Below the `lg` breakpoint the same DOM stacks and runs a timed loop. Hold the opening pose in CSS before hydration. Use `pointer-events-none` on the stage and `inert` on words once faded, so hidden things cannot intercept clicks.
- **Live backdrop film.** Canvas drawn in a worker; pick at random, never the last one shown, and choose after first paint to avoid a hydration mismatch.

## 5. Reduced motion, three layers

1. A global CSS rule (`animation-duration: .01ms` and friends).
2. The animation library's own switch (for example `MotionConfig reducedMotion="user"`).
3. Per-effect still states. Where the motion *is* the signal, hold a still that carries it; never just vanish. A glow holds its brightest edge; a listening rim holds steady; a drawn mark renders one settled frame; a pinned story unpins and shows its finished state; a launch becomes a short fade. A frozen overlay that would block content is removed (`display:none`), not frozen.

Use a hydration-safe media hook for `prefers-reduced-motion`; a hook that changes what renders between server and client breaks hydration.

## 6. Performance

- **The first screen needs no script.** Make the hero entrance pure CSS. Paint the LCP text dim from frame one (opacity .35, never 0). Reveals must degrade to visible (hide only under `@media (scripting: enabled)`, or add a `<noscript>` unhide).
- **Heavy visuals load late and in their own chunk:** dynamic import behind an IntersectionObserver (about 600px root margin) in a frame that reserves its exact height; start renderers on the first pointer, scroll or key, or after about 5s; show a still poster first and crossfade the live canvas over it.
- **Off the main thread:** canvas work in a worker via `OffscreenCanvas`, with a main-thread fallback.
- **Measure, do not assume.** See the performance proof recipe in [VERIFICATION.md](VERIFICATION.md#7-performance-proof).
- **Budget the expensive CSS.** No `blur()` filter on glows (use eased gradient stops). No per-card `backdrop-blur`. Cap concurrent `<video>` decoders at 2 and respect data-saver.
- **Avoid a motion library where a rAF loop writing CSS variables will do.** A library can sit in front of the LCP.

## 7. Platform traps

- Tailwind v4's `translate-*` and `scale-*` use the separate `translate` and `scale` properties, so they compose with a library's `transform`. Never put both on one element.
- A wrapper that animates a transform becomes the containing block for `position: fixed` children. Release the transform when done.
- 3D canvases that measure with `getBoundingClientRect` lock the wrong size inside a scaling box; measure `offsetSize`.
- An IntersectionObserver honours an ancestor's `clip-path`, so a masked line reveal must observe the heading, not the line.
- React Native: no `className` on Reanimated views on web; avoid `entering` and `exiting` layout animations; fade to the same colour at alpha 0, never `transparent` (iOS interpolates through grey); give every SVG gradient a `useId`; there is no conic gradient, so draw rings as overlapping SVG dashes.
