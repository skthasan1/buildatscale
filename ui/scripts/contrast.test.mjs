/* Run: node --test shared/ui/scripts/contrast.test.mjs */
import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tokenBlocks } from "./contrast.mjs";

const script = fileURLToPath(new URL("./contrast.mjs", import.meta.url));
const CSS = `
:root { --foreground: #f4f4f5; --background: #fafafa; }
@media (prefers-color-scheme: dark) {
  :root { --foreground: #f4f4f5; --background: #111113; }
}
.dark { --background: #000000; }
`;
const LIGHT = { foreground: "#f4f4f5", background: "#fafafa" };

test("default :root reads the light values, not the @media dark block", () => {
  const [r] = tokenBlocks(CSS, [":root"]);
  assert.equal(r.tokens.background, LIGHT.background);
  assert.equal(r.selector, ":root");
});

test("--media overlays the nested dark block and labels the output", () => {
  const [r] = tokenBlocks(CSS, [":root"], "(prefers-color-scheme: dark)");
  assert.equal(r.tokens.background, "#111113");
  assert.equal(r.selector, ":root @media (prefers-color-scheme: dark)");
});

test("plain .dark block still works and inherits from the first selector", () => {
  const [, d] = tokenBlocks(CSS, [":root", ".dark"]);
  assert.equal(d.tokens.background, "#000000");
  assert.equal(d.tokens.foreground, "#f4f4f5");
});

test("several top-level blocks of one selector: last wins", () => {
  const [r] = tokenBlocks(":root{--a:#111111;} :root{--a:#222222;}", [":root"]);
  assert.equal(r.tokens.a, "#222222");
});

test("CLI: default run checks light (fails 1.0x), --media checks dark", () => {
  const f = join(mkdtempSync(join(tmpdir(), "contrast-")), "g.css");
  writeFileSync(f, CSS);
  const light = spawnSync("node", [script, "--css", f, "foreground:background"], { encoding: "utf8" });
  assert.match(light.stdout, /#f4f4f5 \/ #fafafa/);
  assert.equal(light.status, 1);
  const dark = spawnSync("node", [script, "--css", f, "--media", "(prefers-color-scheme: dark)", "foreground:background"], { encoding: "utf8" });
  assert.match(dark.stdout, /@media \(prefers-color-scheme: dark\)/);
  assert.match(dark.stdout, /#f4f4f5 \/ #111113/);
  assert.equal(dark.status, 0);
});
