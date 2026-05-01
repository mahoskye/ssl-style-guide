#!/usr/bin/env node
/**
 * Sync data files into ssl-mcp-server/data/ for self-contained operation.
 *
 * This is a maintainer-only operation — run manually when canonical docs or the
 * generated element reference change. The data/ directory is the runtime source
 * used by the MCP server.
 *
 * The canonical element inventory lives at
 * ssl-style-guide/ssl-element-reference.json, generated from ssl-docs by
 * tools/generate_element_reference.py. This script copies that file into the
 * MCP server's data/ directory along with the supporting style guide and
 * narrative reference docs.
 */

import { copyFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = resolve(__dirname, '..');
const REPO_ROOT = resolve(SERVER_ROOT, '..');
const DATA_DIR = resolve(SERVER_ROOT, 'data');

const filesToBundle = [
  {
    src: 'ssl-style-guide/ssl-element-reference.json',
    dest: 'ssl-element-reference.json',
  },
  {
    src: 'ssl-style-guide/ssl-style-guide.schema.yaml',
    dest: 'ssl-style-guide.schema.yaml',
  },
  {
    src: 'agent-guides/ssl_agent_instructions.md',
    dest: 'ssl_agent_instructions.md',
  },
  {
    src: 'agent-guides/ssl_refactoring_guide.md',
    dest: 'ssl_refactoring_guide.md',
  },
  {
    src: 'ssl-style-guide/ssl-ebnf-grammar.md',
    dest: 'ssl-ebnf-grammar.md',
  },
];

for (const { src, dest } of filesToBundle) {
  copyFileSync(resolve(REPO_ROOT, src), resolve(DATA_DIR, dest));
  console.log(`Copied ${dest}`);
}

// Report element totals from the bundled reference for verification.
const ref = JSON.parse(
  readFileSync(resolve(DATA_DIR, 'ssl-element-reference.json'), 'utf8')
);
const totals = ref.totals ?? {};
const totalsPretty = Object.entries(totals)
  .filter(([k]) => k !== 'all')
  .map(([k, v]) => `${v} ${k}`)
  .join(', ');
console.log(
  `\nReference totals: ${totalsPretty} (${totals.all ?? 'unknown'} total)`
);

console.log('\nDone. All files synced to ssl-mcp-server/data/.');
