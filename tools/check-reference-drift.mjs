#!/usr/bin/env bun

/**
 * Flag drift between the bundled JSON inventory and the authoritative
 * ssl-docs reference content.
 *
 * Checks:
 *   1. Bundle parity — ssl-style-guide/*.json equals ssl-mcp-server/data/*.json
 *      byte-for-byte (the MCP bundle must mirror the canonical files).
 *   2. Name-set parity per category — every element file in
 *      ../ssl-docs/content/reference/<category>/*.md appears in the bundled
 *      JSON, and vice versa.
 *   3. Internal totals — meta.totals.elements / by_type match the actual
 *      elements array; reference.totals.all equals the sum of category totals.
 *   4. Content parity — the vendored meta equals
 *      ../ssl-docs/content/data/ssl-element-meta.json, and the vendored
 *      reference equals a fresh run of tools/generate_element_reference.py.
 *      A warning by default (ssl-docs moves independently, so this should not
 *      block unrelated PRs); an error with --strict.
 *
 * Skips gracefully (exit 0) when ../ssl-docs is not present, so consumers who
 * only clone ssl-style-guide are not blocked.
 *
 * Usage:
 *   bun tools/check-reference-drift.mjs [--ssl-docs <path>] [--strict]
 */

import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { tmpdir } from 'os';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const docsArgIndex = process.argv.indexOf('--ssl-docs');
const SSL_DOCS = resolve(
  REPO_ROOT,
  docsArgIndex !== -1 ? process.argv[docsArgIndex + 1] : '../ssl-docs'
);
const DOCS_REF = join(SSL_DOCS, 'content', 'reference');
const DOCS_META = join(SSL_DOCS, 'content', 'data', 'ssl-element-meta.json');
const STRICT = process.argv.includes('--strict');
const REFRESH_HINT =
  'Refresh order: copy ssl-docs/content/data/ssl-element-meta.json, ' +
  "run 'python3 tools/generate_element_reference.py', " +
  "'bun tools/generate-machine-docs.mjs', then 'cd ssl-mcp-server && bun run bundle-data'.";

// JSON key -> ssl-docs directory name.
const CATEGORIES = {
  keywords: 'keywords',
  operators: 'operators',
  literals: 'literals',
  types: 'types',
  classes: 'classes',
  special_forms: 'special-forms',
  returns: 'returns',
  functions: 'functions',
};

const STYLE_REF = resolve(REPO_ROOT, 'ssl-style-guide/ssl-element-reference.json');
const STYLE_META = resolve(REPO_ROOT, 'ssl-style-guide/ssl-element-meta.json');
const MCP_REF = resolve(REPO_ROOT, 'ssl-mcp-server/data/ssl-element-reference.json');
const MCP_META = resolve(REPO_ROOT, 'ssl-mcp-server/data/ssl-element-meta.json');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function listDocsCategory(dir) {
  const path = join(DOCS_REF, dir);
  if (!existsSync(path)) return new Set();
  return new Set(
    readdirSync(path)
      .filter((f) => f.endsWith('.md') && f !== 'index.md')
      .map((f) => f.replace(/\.md$/, '').toLowerCase())
  );
}

function checkBundleParity(errors) {
  const styleRefRaw = readFileSync(STYLE_REF, 'utf8');
  const styleMetaRaw = readFileSync(STYLE_META, 'utf8');
  const mcpRefRaw = readFileSync(MCP_REF, 'utf8');
  const mcpMetaRaw = readFileSync(MCP_META, 'utf8');
  if (styleRefRaw !== mcpRefRaw) {
    errors.push(
      'Bundle drift: ssl-style-guide/ssl-element-reference.json != ' +
      'ssl-mcp-server/data/ssl-element-reference.json — ' +
      "run 'bun ssl-mcp-server/scripts/bundle-data.mjs'."
    );
  }
  if (styleMetaRaw !== mcpMetaRaw) {
    errors.push(
      'Bundle drift: ssl-style-guide/ssl-element-meta.json != ' +
      'ssl-mcp-server/data/ssl-element-meta.json — ' +
      "run 'bun ssl-mcp-server/scripts/bundle-data.mjs'."
    );
  }
}

function checkInternalTotals(ref, meta, errors) {
  const refSum = Object.entries(ref.totals)
    .filter(([k]) => k !== 'all')
    .reduce((a, [, v]) => a + v, 0);
  if (refSum !== ref.totals.all) {
    errors.push(`reference totals: sum of categories ${refSum} != totals.all ${ref.totals.all}`);
  }
  for (const [key] of Object.entries(CATEGORIES)) {
    const declared = ref.totals[key];
    const actual = Object.keys(ref[key] ?? {}).length;
    if (declared !== actual) {
      errors.push(`reference totals.${key}: declared ${declared} but ${actual} keys present`);
    }
  }
  const byType = {};
  for (const e of meta.elements) byType[e.element_type] = (byType[e.element_type] ?? 0) + 1;
  for (const [type, declared] of Object.entries(meta.totals.by_type)) {
    if ((byType[type] ?? 0) !== declared) {
      errors.push(`meta totals.by_type.${type}: declared ${declared} but ${byType[type] ?? 0} elements present`);
    }
  }
  if (meta.totals.elements !== meta.elements.length) {
    errors.push(`meta totals.elements: declared ${meta.totals.elements} but ${meta.elements.length} elements present`);
  }
}

function checkDocsParity(ref, errors) {
  for (const [key, dir] of Object.entries(CATEGORIES)) {
    const docs = listDocsCategory(dir);
    const json = new Set(Object.keys(ref[key] ?? {}).map((s) => s.toLowerCase()));
    const extra = [...json].filter((n) => !docs.has(n)).sort();
    const missing = [...docs].filter((n) => !json.has(n)).sort();
    if (extra.length) {
      errors.push(`${key}: present in bundled JSON but not in ssl-docs: ${extra.join(', ')}`);
    }
    if (missing.length) {
      errors.push(
        `${key}: present in ssl-docs but missing from bundled JSON: ${missing.join(', ')} — ` +
        "run 'python3 tools/generate_element_reference.py' and the ssl-docs meta extractor."
      );
    }
  }
}

function changedNames(vendored, current) {
  const names = new Set([...Object.keys(vendored), ...Object.keys(current)]);
  return [...names]
    .filter((n) => JSON.stringify(vendored[n]) !== JSON.stringify(current[n]))
    .sort();
}

function summarize(names) {
  const shown = names.slice(0, 8).join(', ');
  return names.length > 8 ? `${shown}, … (${names.length} total)` : shown;
}

function checkMetaContent(drift) {
  if (!existsSync(DOCS_META)) return;
  const vendoredRaw = readFileSync(STYLE_META, 'utf8');
  const currentRaw = readFileSync(DOCS_META, 'utf8');
  if (vendoredRaw === currentRaw) return;
  const byId = (m) => Object.fromEntries(m.elements.map((e) => [e.id, e]));
  const changed = changedNames(byId(JSON.parse(vendoredRaw)), byId(JSON.parse(currentRaw)));
  drift.push(
    `ssl-element-meta.json differs from ssl-docs (${changed.length} elements): ${summarize(changed)}`
  );
}

function checkReferenceContent(ref, drift, notes) {
  const tmp = mkdtempSync(join(tmpdir(), 'ssl-ref-'));
  const out = join(tmp, 'ssl-element-reference.json');
  try {
    const run = spawnSync(
      'python3',
      [resolve(REPO_ROOT, 'tools/generate_element_reference.py'), '--ssl-docs', SSL_DOCS, '--out', out],
      { encoding: 'utf8' }
    );
    if (run.error || run.status !== 0) {
      notes.push('python3 generator unavailable or failed — skipping reference content check.');
      return;
    }
    const current = readJson(out);
    const changed = [];
    for (const key of Object.keys(CATEGORIES)) {
      for (const name of changedNames(ref[key] ?? {}, current[key] ?? {})) {
        changed.push(`${key}/${name}`);
      }
    }
    if (changed.length) {
      drift.push(
        `ssl-element-reference.json differs from a fresh generation (${changed.length} elements): ${summarize(changed)}`
      );
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

function reportDrift(drift) {
  const label = STRICT ? 'error' : 'warning';
  for (const d of drift) {
    if (process.env.GITHUB_ACTIONS) console.log(`::${label} title=Reference content drift::${d}`);
    console.error(`Content drift (${label}): ${d}`);
  }
  console.error(`  ${REFRESH_HINT}`);
}

function main() {
  const ref = readJson(STYLE_REF);
  const meta = readJson(STYLE_META);
  const errors = [];
  const drift = [];
  const notes = [];

  checkBundleParity(errors);
  checkInternalTotals(ref, meta, errors);

  if (!existsSync(DOCS_REF)) {
    if (errors.length) {
      console.error('Reference drift detected:');
      for (const e of errors) console.error(`  - ${e}`);
      process.exit(1);
    }
    console.log(
      `ssl-docs not found at ${SSL_DOCS} — skipping name-set parity check. ` +
      `Bundle parity and internal totals OK (${ref.totals.all} elements).`
    );
    return;
  }

  checkDocsParity(ref, errors);
  checkMetaContent(drift);
  checkReferenceContent(ref, drift, notes);

  for (const n of notes) console.log(n);
  if (drift.length) reportDrift(drift);
  if (STRICT) errors.push(...drift);

  if (errors.length) {
    console.error('Reference drift detected:');
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  const what = drift.length
    ? 'Reference names and totals in sync with ssl-docs, content behind (see warnings)'
    : 'Reference data in sync with ssl-docs';
  console.log(`${what} (${ref.totals.all} elements; bundle parity OK).`);
}

main();
