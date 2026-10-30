#!/usr/bin/env node
/* WCAG 2 contrast for colour pairs, in any of the formats design tokens are authored in:
   #hex, rgb(), hsl(), a bare HSL triplet ("228 25% 98%"), oklch(). Alpha is ignored and reported, because a translucent
   colour's contrast depends on what is under it: measure the composited colour instead.

   Pair mode:
     node contrast.mjs "#FF7A1A" "#0B0B0E" "oklch(54% .1 72)" "oklch(97.6% .004 85)"

   Token mode (reads --name: value; from each selector block of a stylesheet, resolves var()):
     node contrast.mjs --css src/app/globals.css --selector ":root" --selector ".dark" \
       foreground:background muted-foreground:card accent-foreground:accent
     Only TOP-LEVEL blocks are read; blocks nested in @media/@supports/@layer are ignored. For a dark theme declared as
     @media (prefers-color-scheme: dark) { :root { ... } }, add --media to overlay that query's blocks on the top-level values:
       node contrast.mjs --css src/app/globals.css --selector ":root" --media "(prefers-color-scheme: dark)" foreground:background
     Add =3 to a pair to hold it to 3:1 instead of 4.5:1 (rings, icons, large text):
       ring:background=3
   Exit code 1 when any pair misses its floor, so it can sit in a gate. */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

const hslToSrgb = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
};

const oklchToLinear = (L, C, H) => {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.min(1, Math.max(0, v)));
};

const num = (t, scale = 1) => (t.endsWith("%") ? (parseFloat(t) / 100) * scale : parseFloat(t));

/* Returns { linear: [r,g,b], alpha } or null when the value is not a literal colour. */
function parse(raw) {
  const v = raw.trim().toLowerCase();
  let m;
  if ((m = v.match(/^#([0-9a-f]{3,8})$/))) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join("");
    const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
    return { linear: [n(0), n(2), n(4)].map(toLinear), alpha: h.length === 8 ? n(6) : 1 };
  }
  const parts = (s) => s.replace(/[,/]/g, " ").split(/\s+/).filter(Boolean);
  if ((m = v.match(/^rgba?\((.*)\)$/))) {
    const p = parts(m[1]);
    const ch = p.slice(0, 3).map((t) => (t.endsWith("%") ? num(t) : parseFloat(t) / 255));
    return { linear: ch.map(toLinear), alpha: p[3] ? num(p[3]) : 1 };
  }
  if ((m = v.match(/^hsla?\((.*)\)$/)) || (m = v.match(/^([\d.]+(?:deg)?\s+[\d.]+%\s+[\d.]+%(?:\s*\/\s*[\d.]+%?)?)$/))) {
    const p = parts(m[1]);
    return { linear: hslToSrgb(parseFloat(p[0]), parseFloat(p[1]), parseFloat(p[2])).map(toLinear), alpha: p[3] ? num(p[3]) : 1 };
  }
  if ((m = v.match(/^oklch\((.*)\)$/))) {
    const p = parts(m[1]);
    if (p.some((t) => t === "from" || t.startsWith("calc"))) return null;
    return { linear: oklchToLinear(num(p[0]), num(p[1], 0.4), parseFloat(p[2]) || 0), alpha: p[3] ? num(p[3]) : 1 };
  }
  return null;
}

const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a.linear), luminance(b.linear)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/* Splits CSS into its blocks at one nesting level: { prelude, body }. Comments are dropped first. */
function splitBlocks(css) {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = [];
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf("{", i);
    if (open < 0) break;
    const start = Math.max(i, src.lastIndexOf(";", open) + 1, src.lastIndexOf("}", open) + 1);
    let depth = 1;
    let j = open + 1;
    for (; j < src.length && depth; j++) depth += src[j] === "{" ? 1 : src[j] === "}" ? -1 : 0;
    out.push({ prelude: src.slice(start, open).trim().replace(/\s+/g, " "), body: src.slice(open + 1, j - 1) });
    i = j;
  }
  return out;
}

const declarations = (body) => {
  const out = {};
  let own = body;
  for (let prev; prev !== own; ) (prev = own), (own = own.replace(/\{[^{}]*\}/g, "")); /* drop nested rules */
  for (const d of own.matchAll(/--([\w-]+)\s*:\s*([^;]+);?/g)) out[d[1]] = d[2].trim();
  return out;
};

/* Reads the tokens of one selector. Only TOP-LEVEL blocks count (later ones win); blocks nested in @media, @supports,
   @layer or @container are ignored unless `media` names an @media query, whose nested blocks are overlaid on top. */
function readSelector(css, selector, media) {
  const matches = (prelude) => prelude.split(",").some((p) => p.trim() === selector);
  const norm = (m) => m.replace(/\s+/g, " ").replace(/\s*:\s*/g, ":").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")").trim().toLowerCase();
  const blocks = splitBlocks(css);
  const out = {};
  for (const b of blocks) if (!b.prelude.startsWith("@") && matches(b.prelude)) Object.assign(out, declarations(b.body));
  if (media) {
    const want = norm(media);
    for (const b of blocks) {
      if (!/^@media\b/i.test(b.prelude) || norm(b.prelude.replace(/^@media\s*/i, "")) !== want) continue;
      for (const inner of splitBlocks(b.body)) if (matches(inner.prelude)) Object.assign(out, declarations(inner.body));
    }
  }
  return out;
}

export function tokenBlocks(css, selectors, media) {
  const base = readSelector(css, selectors[0], media);
  return selectors.map((s, i) => ({
    selector: media ? s + " @media " + media : s,
    tokens: i === 0 ? base : { ...base, ...readSelector(css, s, media) },
  }));
}

function resolve(tokens, name, depth = 0) {
  let v = tokens[name];
  if (v === undefined || depth > 8) return { value: v };
  const ref = v.match(/^var\(--([\w-]+)\s*(?:,\s*(.+))?\)$/);
  if (ref) return tokens[ref[1]] !== undefined ? resolve(tokens, ref[1], depth + 1) : { value: ref[2] };
  if (/^hsl\(var\(--([\w-]+)\)\)$/.test(v)) return resolve(tokens, v.match(/--([\w-]+)/)[1], depth + 1);
  return { value: v };
}

function report(label, fgRaw, bgRaw, floor) {
  const fg = parse(fgRaw);
  const bg = parse(bgRaw);
  if (!fg || !bg) {
    console.log(`  ??    ${label}: cannot evaluate (${!fg ? fgRaw : bgRaw}); measure the rendered colour instead`);
    return true;
  }
  const r = ratio(fg, bg);
  const pass = r + 1e-9 >= floor;
  const note = fg.alpha < 1 || bg.alpha < 1 ? "  (alpha ignored: measure the composited colour)" : "";
  console.log(`  ${pass ? "ok  " : "FAIL"}  ${r.toFixed(2).padStart(5)}:1  floor ${floor}  ${label}${note}`);
  return pass;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();

function main() {
const args = process.argv.slice(2);
let ok = true;
if (args[0] === "--css") {
  const cssPath = args[1];
  const selectors = [];
  const pairs = [];
  let media;
  for (let i = 2; i < args.length; i++) {
    if (args[i] === "--selector") selectors.push(args[++i]);
    else if (args[i] === "--media") media = args[++i];
    else pairs.push(args[i]);
  }
  if (!selectors.length) selectors.push(":root");
  const css = readFileSync(cssPath, "utf8");
  for (const { selector, tokens } of tokenBlocks(css, selectors, media)) {
    console.log(selector);
    for (const pair of pairs) {
      const [names, f] = pair.split("=");
      const [fgName, bgName] = names.split(":");
      const fg = resolve(tokens, fgName).value;
      const bg = resolve(tokens, bgName).value;
      if (fg === undefined || bg === undefined) {
        console.log(`  ??    ${names}: --${fg === undefined ? fgName : bgName} not found in ${selector}`);
        continue;
      }
      ok = report(`${fgName} on ${bgName}  (${fg} / ${bg})`, fg, bg, f ? Number(f) : 4.5) && ok;
    }
  }
} else if (args.length >= 2 && args.length % 2 === 0) {
  for (let i = 0; i < args.length; i += 2) ok = report(`${args[i]} on ${args[i + 1]}`, args[i], args[i + 1], 4.5) && ok;
} else {
  console.log('Usage: node contrast.mjs <fg> <bg> [<fg> <bg> ...]\n       node contrast.mjs --css <file> [--selector ":root"] [--selector ".dark"] [--media "(prefers-color-scheme: dark)"] fg:bg[=3] ...');
  process.exit(2);
}
process.exit(ok ? 0 : 1);
}
