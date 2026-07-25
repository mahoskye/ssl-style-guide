#!/usr/bin/env node
/**
 * Download pre-built starlims-lsp binaries from the GitHub release pinned in
 * lsp-version.json into ssl-mcp-server/bin/lsp/. This is the standard way to
 * obtain the binaries; building from a sibling checkout (bundle-lsp.mjs) is
 * the maintainer path.
 *
 * Usage:
 *   bun scripts/fetch-lsp.mjs               # pinned version, current platform
 *   bun scripts/fetch-lsp.mjs --all         # pinned version, all platforms
 *   bun scripts/fetch-lsp.mjs v0.15.0       # fetch that tag and update the pin
 */

import { chmodSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = resolve(__dirname, '..');
const PIN_FILE = resolve(SERVER_ROOT, 'lsp-version.json');
const DEST = resolve(SERVER_ROOT, 'bin', 'lsp');

const ALL_ASSETS = [
  'starlims-lsp-darwin-amd64',
  'starlims-lsp-darwin-arm64',
  'starlims-lsp-linux-amd64',
  'starlims-lsp-linux-arm64',
  'starlims-lsp-windows-amd64.exe',
];

function currentPlatformAsset() {
  const goArch = process.arch === 'x64' ? 'amd64' : process.arch;
  if (process.platform === 'win32') return `starlims-lsp-windows-${goArch}.exe`;
  if (process.platform === 'darwin') return `starlims-lsp-darwin-${goArch}`;
  return `starlims-lsp-linux-${goArch}`;
}

const args = process.argv.slice(2);
const all = args.includes('--all');
const tagArg = args.find((a) => !a.startsWith('--'));

const pin = JSON.parse(readFileSync(PIN_FILE, 'utf8'));
const tag = tagArg ?? pin.version;
const assets = all ? ALL_ASSETS : [currentPlatformAsset()];

mkdirSync(DEST, { recursive: true });

console.log(`Fetching starlims-lsp ${tag} from ${pin.repo} (${assets.length} binar${assets.length === 1 ? 'y' : 'ies'})...`);

for (const asset of assets) {
  const url = `https://github.com/${pin.repo}/releases/download/${tag}/${asset}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed to download ${url}: HTTP ${res.status}`);
    console.error(`Check that release ${tag} exists with asset ${asset}:`);
    console.error(`  https://github.com/${pin.repo}/releases`);
    process.exit(1);
  }
  const dst = resolve(DEST, asset);
  writeFileSync(dst, Buffer.from(await res.arrayBuffer()));
  if (!asset.endsWith('.exe')) chmodSync(dst, 0o755);
  console.log(`  ${asset}`);
}

if (tagArg && tagArg !== pin.version) {
  writeFileSync(PIN_FILE, JSON.stringify({ ...pin, version: tagArg }, null, 2) + '\n');
  console.log(`Updated pin in lsp-version.json: ${pin.version} -> ${tagArg}`);
}

console.log(`\nDone. Binaries in ${DEST}`);
