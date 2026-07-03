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
 *
 * Skips gracefully (exit 0) when ../ssl-docs is not present, so consumers who
 * only clone ssl-style-guide are not blocked.
 *
 * Usage:
 *   bun tools/check-reference-drift.mjs [--ssl-docs <path>]
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const docsArgIndex = process.argv.indexOf('--ssl-docs');
const SSL_DOCS = resolve(
  REPO_ROOT,
  docsArgIndex !== -1 ? process.argv[docsArgIndex + 1] : '../ssl-docs'
);
const DOCS_REF = join(SSL_DOCS, 'content', 'reference');

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

function main() {
  const ref = readJson(STYLE_REF);
  const meta = readJson(STYLE_META);
  const errors = [];

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

  if (errors.length) {
    console.error('Reference drift detected:');
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(
    `Reference data in sync with ssl-docs (${ref.totals.all} elements; ` +
    `bundle parity OK).`
  );
}

main();
