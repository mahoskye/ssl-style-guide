#!/usr/bin/env node
/**
 * Build starlims-lsp binaries and copy them into ssl-mcp-server/bin/lsp/.
 *
 * Prerequisites:
 *   - Go toolchain installed
 *   - The starlims-lsp repo cloned as a sibling at ../../starlims-lsp
 *     (relative to the ssl-style-guide repo root)
 *
 * Usage:
 *   bun scripts/bundle-lsp.mjs            # build all platforms
 *   bun scripts/bundle-lsp.mjs --copy     # skip build, just copy existing binaries
 */

import { execSync } from 'child_process';
import { cpSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = resolve(__dirname, '..');
const REPO_ROOT = resolve(SERVER_ROOT, '..');
const LSP_REPO = resolve(REPO_ROOT, '..', 'starlims-lsp');
const LSP_BIN = resolve(LSP_REPO, 'bin');
const DEST = resolve(SERVER_ROOT, 'bin', 'lsp');

const copyOnly = process.argv.includes('--copy');

if (!existsSync(LSP_REPO)) {
  console.error(`starlims-lsp repo not found at ${LSP_REPO}`);
  console.error('Expected layout: parent/starlims-lsp and parent/ssl-style-guide');
  process.exit(1);
}

if (!copyOnly) {
  console.log('Building starlims-lsp binaries (all platforms)...');
  try {
    execSync('make build-all', { cwd: LSP_REPO, stdio: 'inherit' });
  } catch (err) {
    console.error('Build failed. Is Go installed?');
    process.exit(1);
  }
}

mkdirSync(DEST, { recursive: true });

const binaries = readdirSync(LSP_BIN).filter(
  (f) => f.startsWith('starlims-lsp-') && !f.endsWith('.test')
);

if (binaries.length === 0) {
  console.error(`No platform binaries found in ${LSP_BIN}`);
  process.exit(1);
}

for (const bin of binaries) {
  const src = resolve(LSP_BIN, bin);
  const dst = resolve(DEST, bin);
  cpSync(src, dst);
  console.log(`  ${bin}`);
}

console.log(`\nBundled ${binaries.length} binaries into ${DEST}`);

// The bundled binaries land as large loose git objects; without an
// occasional repack, pack-objects grinds for minutes on every push (each
// bundle run adds ~45MB loose, and git's default auto-gc threshold counts
// objects, not bytes). Let git decide — this is a no-op when the repo is
// already packed.
try {
  execSync('git gc --auto', { cwd: REPO_ROOT, stdio: 'inherit' });
} catch {
  console.warn('git gc --auto failed (non-fatal)');
}
