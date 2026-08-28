#!/usr/bin/env bun

/**
 * Deploy workflow skills from the canonical agent-guides/skills/ into the
 * directories where each tool discovers them:
 *   - .claude/skills/    Claude Code — and opencode, via its Claude-compat
 *                        discovery, which is the ONLY opencode path we use.
 *
 * Do NOT deploy to .opencode/skills/: with opencode 1.18.14 its presence
 * hangs every `opencode run --agent` session before first output
 * (verified by bisection 2026-08-10). Claude-compat discovery of
 * .claude/skills/ covers opencode fully.
 *
 * Previously .claude/skills/ was a hand-maintained copy and drifted
 * (ssl-new-datasource was missing, 2026-08-09). Run this after adding or
 * editing a skill. `--check` verifies sync without writing.
 */

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const CANONICAL = resolve(REPO_ROOT, 'agent-guides/skills');
const TARGETS = [
  resolve(REPO_ROOT, '.claude/skills'),
];
const CHECK_ONLY = process.argv.includes('--check');

const skills = readdirSync(CANONICAL, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((name) => existsSync(resolve(CANONICAL, name, 'SKILL.md')));

let drift = 0;
for (const target of TARGETS) {
  for (const skill of skills) {
    const src = resolve(CANONICAL, skill);
    const dst = resolve(target, skill);
    const srcMd = readFileSync(resolve(src, 'SKILL.md'), 'utf8');
    const dstMdPath = resolve(dst, 'SKILL.md');
    const inSync = existsSync(dstMdPath) && readFileSync(dstMdPath, 'utf8') === srcMd;
    if (inSync) continue;
    drift += 1;
    if (CHECK_ONLY) {
      console.error(`out of sync: ${dst}`);
    } else {
      rmSync(dst, { recursive: true, force: true });
      mkdirSync(target, { recursive: true });
      cpSync(src, dst, { recursive: true });
      console.log(`deployed ${skill} -> ${target}`);
    }
  }
}

if (CHECK_ONLY && drift > 0) process.exit(1);
console.log(`${skills.length} skills, ${drift} ${CHECK_ONLY ? 'out of sync' : 'updated'}`);
