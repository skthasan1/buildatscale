# Mobile (React Native / Expo) and porting web to native

Generic guidance for a native app that mirrors a web product. If the project has a mobile design contract (for example an `AGENTS.md` or `docs/ux-patterns.md` mobile section), read it first; it wins over this file.

## Port the idea, not the pixels

Carry the **token names and rules** across verbatim and re-derive each effect for the platform.

| Web | Native |
|---|---|
| Tokens in a stylesheet (OKLCH, HSL or hex) | sRGB values in one palette module. If the styling library's `colors` is replaced rather than extended, only tokens compile. |
| Glass with `backdrop-blur` over a flat ground | An opaque panel (a blur costs frames and looks the same) |
| Conic gradient ring | Overlapping SVG dashes |
| CSS wash with a mask | SVG with a stretched viewBox fading to the opaque canvas |
| Sidebar | A header menu card (see Navigation) |
| Grid restacking below a breakpoint | A fixed label column with horizontally scrolling columns |
| A query-param pane | Its own route |
| Browser back | A small chevron at a 44pt target in the eyebrow line |

What stays identical: token names, the accent rule, media plates dark in both themes, the eyebrow spec, the ease curve and durations, and the copy. Native adds haptics on commitment, the camera, double-tap gestures and a branded pull-to-refresh.

## Navigation

Prefer a compact **header menu card** over a full-height drawer, which reads as big and clunky. A card anchored top right, with a hairline border, a light scrim, an account row, hairline-ruled groups of rows, the current page marked with an accent glyph, and a compact theme switch at the foot. Take destinations from one config file. Keep screens in a tabs navigator with the tab bar hidden, so their state persists. A new primary destination is a design decision, not an append to the nav file.

## Sizing

- **44pt targets around small visuals:** a 36 pill inside 44, a 28 disc inside 44. Do not rely on `hitSlop`, because it cannot reach past a parent's bounds.
- Use minimum heights (`min-h-11`, `min-h-12`) so Dynamic Type can grow controls.
- Spacing on the same scale as the web (rem 16). A 20 gutter on phones, wider from 640.
- **Check wide widths.** Reviewers often open the app in a desktop browser; a phone-only layout stretched to 1280 reads as broken. Define the breakpoints that matter (a phone column over a blur from about 600, side-by-side layouts from 640 to 768, split panes from 1024) and capture at 390 and 1280.
- Fonts: one family per weight (`Family_400Regular`, `_500Medium`, `_600SemiBold`), because Android fakes `font-medium`. RN text does not inherit fonts.
- Tabular numerals through a `fontVariant` style prop, because some styling libraries drop the class.

## Refinement defaults

- **Headers trimmed:** a logo mark without a wordmark on tab screens; a compact one-line page header (title plus a count) with no eyebrow.
- **Composer controls** are flat tinted tiles with plain glyphs. No tick rings, sunken medallions or captions.
- **A voice orb** is clean and minimal and is itself the control; no gloss, bands or extra buttons.

## Platform traps

- No `className` on Reanimated views on web; no `entering` or `exiting` layout animations.
- Fade to the same colour at alpha 0 (iOS interpolates `transparent` through grey). Give every SVG gradient a `useId` id. Build gestures in `useMemo`.
- A CDP mouse drag needs `button: 'left'` plus `buttons: 1` on every `mouseMoved`, or gesture handlers on web ignore it.
- Prefer `dismissTo` over `Redirect` outside tabs. Use `aria-hidden` rather than `importantForAccessibility`.
- Clamp scroll offsets and pad with a keyboard-height hook rather than `automaticallyAdjustKeyboardInsets`. A reveal at the end of a scroll view needs `overflow-hidden`.
- RN `Alert` does not show on web; use a custom modal.
- Import icons one file each if the icon library's index bloats the bundle (lint-ban the index).
- Stale editor saves can revert whole features. When files look older than expected, compare mtimes (several files written in the same second is the tell) and ask before choosing.
