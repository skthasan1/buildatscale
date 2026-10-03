#!/usr/bin/env node
// ci/check-claude-md-budget.mjs — zero-dependency CLAUDE.md size budget checker
//
// Usage:   node ci/check-claude-md-budget.mjs
// CI:      add `node ci/check-claude-md-budget.mjs` as a step in your workflow
//
// Reads limits from the <!--claude-md-budget ... --> block in CLAUDE.md.
// Exits 0 if all checks pass, 1 if any fail (with a clear message naming the section).
//
// Default limits (used when no budget block is found — warn only, do not fail):
//   total_kb:          64    (mature project default)
//   current_status_kb:  6
//   session_index_kb:   3
//
// New-project tight limits (set these when CLAUDE.md < 10 KB at Session 0):
//   total_kb:          16
//   current_status_kb:  2
//   session_index_kb:   1

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const CLAUDE_MD = join(ROOT, 'CLAUDE.md');

let failed = false;

function fail(msg) {
  console.error(`❌  CLAUDE.md budget FAIL: ${msg}`);
  failed = true;
}

function ok(msg) {
  console.log(`✅  ${msg}`);
}

// Read CLAUDE.md
let content;
try {
  content = readFileSync(CLAUDE_MD, 'utf8');
} catch {
  fail('CLAUDE.md not found at repo root.');
  process.exit(1);
}

// Normalize line endings so the regex works on Windows (CRLF) and Unix (LF)
const normalized = content.replace(/\r\n/g, '\n');

// Parse budget block
const budgetMatch = normalized.match(/<!--claude-md-budget\n([\s\S]*?)-->/);
if (!budgetMatch) {
  console.warn(
    '⚠️   No <!--claude-md-budget --> block found in CLAUDE.md.\n' +
    '    Add one — see shared/FRAMEWORK.md §3.1.\n' +
    '    Falling back to mature-project defaults for this run.'
  );
}

const budget = {};
if (budgetMatch) {
  for (const line of budgetMatch[1].trim().split('\n')) {
    const m = line.match(/^\s*([\w_]+)\s*:\s*(.+?)\s*$/);
    if (m) budget[m[1]] = m[2];
  }
}

const totalKbLimit       = parseFloat(budget.total_kb          ?? '64');
const currentStatusLimit = parseFloat(budget.current_status_kb ?? '6');
const sessionIndexLimit  = parseFloat(budget.session_index_kb  ?? '3');

// Helper: measure a section from "## Heading" to the next "## " heading or EOF
function extractSection(text, heading) {
  // Escape heading for regex (handles parens, brackets, etc.)
  const esc = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // No 'm' flag: $ means end-of-string. Use \n## to catch the next heading
  // explicitly rather than ^ under 'm', which caused $ to match end-of-every-line
  // (making [\s\S]*? stop immediately after the heading line — reporting 0 KB always).
  const re = new RegExp(`## ${esc}[\\s\\S]*?(?=\\n## |\\n<!--claude-md-budget|$)`);
  const m = text.match(re);
  return m ? m[0] : null;
}

function kbOf(str) {
  return Buffer.byteLength(str, 'utf8') / 1024;
}

// 1. Total file size
const totalKb = kbOf(normalized);
if (totalKb > totalKbLimit) {
  fail(
    `Total size ${totalKb.toFixed(1)} KB exceeds budget of ${totalKbLimit} KB.\n` +
    `    Trim ## Current status or ## Session notes — older entries belong in docs/session-notes/.`
  );
} else {
  ok(`Total size ${totalKb.toFixed(1)} KB / ${totalKbLimit} KB`);
}

// 2. ## Current status section
const currentSection = extractSection(normalized, 'Current status');
if (currentSection) {
  const kb = kbOf(currentSection);
  if (kb > currentStatusLimit) {
    fail(
      `## Current status is ${kb.toFixed(1)} KB, budget is ${currentStatusLimit} KB.\n` +
      `    Move phase summaries to a session note file; keep only the live snapshot here.`
    );
  } else {
    ok(`Current status ${kb.toFixed(1)} KB / ${currentStatusLimit} KB`);
  }
} else {
  console.log('   ℹ️   No ## Current status section found — skipping that check.');
}

// 3. ## Session notes section (should be an index only)
const sessionSection = extractSection(normalized, 'Session notes');
if (sessionSection) {
  const kb = kbOf(sessionSection);
  if (kb > sessionIndexLimit) {
    fail(
      `## Session notes is ${kb.toFixed(1)} KB, budget is ${sessionIndexLimit} KB.\n` +
      `    This section should be an index only — one line per session linking to\n` +
      `    docs/session-notes/YYYY-MM-DD.md. Move inline notes to those files.`
    );
  } else {
    ok(`Session notes index ${kb.toFixed(1)} KB / ${sessionIndexLimit} KB`);
  }
} else {
  console.log('   ℹ️   No ## Session notes section found — skipping that check.');
}

if (failed) {
  process.exit(1);
}
