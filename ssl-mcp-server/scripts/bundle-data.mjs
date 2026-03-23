#!/usr/bin/env node
/**
 * Sync data files into ssl-mcp-server/data/ for self-contained operation.
 *
 * This is a maintainer-only operation — run manually when canonical docs change
 * or when checked-in external inventory snapshots are updated. The data/
 * directory is the runtime source used by the MCP server.
 *
 * The JSON inventories in data/ are not regenerated in this repo. This script
 * only normalizes those checked-in snapshots and refreshes the mirrored
 * canonical docs.
 */

import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = resolve(__dirname, '..');
const REPO_ROOT = resolve(SERVER_ROOT, '..');
const DATA_DIR = resolve(SERVER_ROOT, 'data');

function readBundledJson(filename) {
  return JSON.parse(readFileSync(resolve(DATA_DIR, filename), 'utf8'));
}

function writeBundledJson(filename, value) {
  writeFileSync(resolve(DATA_DIR, filename), JSON.stringify(value, null, 2) + '\n');
}

// 1. Inventory snapshots — normalize checked-in external JSON snapshots.
const elements = readBundledJson('ssl-element-list.json');
writeBundledJson('ssl-element-list.json', elements);
console.log(`Normalized ssl-element-list.json (${elements.length} elements)`);

const classVal = readBundledJson('class-member-validation.json');
writeBundledJson('class-member-validation.json', classVal);
console.log(`Normalized class-member-validation.json (${classVal.classes.length} classes)`);

// 2. Supporting files — copy from canonical locations in this repo.
const supportingFiles = [
  { src: 'ssl-style-guide/ssl-style-guide.schema.yaml', dest: 'ssl-style-guide.schema.yaml' },
  { src: 'agent-guides/ssl_agent_instructions.md', dest: 'ssl_agent_instructions.md' },
  { src: 'agent-guides/ssl_refactoring_guide.md', dest: 'ssl_refactoring_guide.md' },
  { src: 'ssl-style-guide/ssl-ebnf-grammar.md', dest: 'ssl-ebnf-grammar.md' },
];

for (const { src, dest } of supportingFiles) {
  copyFileSync(resolve(REPO_ROOT, src), resolve(DATA_DIR, dest));
  console.log(`Copied ${dest}`);
}

console.log('\nDone. All files synced to ssl-mcp-server/data/ from this repository.');
