#!/usr/bin/env bun

/**
 * Deploy generated SSL agent adapters into user-level tool directories.
 *
 * This keeps workspace adapters available for local testing while installing
 * the same agent definitions where each tool discovers personal agents across
 * projects:
 *   - GitHub Copilot / VS Code / Copilot CLI: ~/.copilot/agents
 *   - Claude Code: ~/.claude/agents
 *   - OpenCode: ~/.config/opencode/agents
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { buildAgentAdapterOutputs } from './generate-agents.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');

const TARGETS = [
  {
    name: 'copilot',
    destDir: resolve(homedir(), '.copilot/agents'),
    labelPrefix: '.github/agents/',
  },
  {
    name: 'claude',
    destDir: resolve(homedir(), '.claude/agents'),
    labelPrefix: '.claude/agents/',
  },
  {
    name: 'opencode',
    destDir: resolve(homedir(), '.config/opencode/agents'),
    labelPrefix: '.opencode/agents/',
  },
];

function deployTarget(target, outputs) {
  const targetOutputs = outputs.filter((output) => output.label.startsWith(target.labelPrefix));
  const drift = [];
  const written = [];

  if (!CHECK_ONLY) {
    mkdirSync(target.destDir, { recursive: true });
  }

  for (const output of targetOutputs) {
    const file = basename(output.label);
    const dest = resolve(target.destDir, file);
    const destText = existsSync(dest) ? readFileSync(dest, 'utf8') : null;

    if (output.content === destText) continue;

    if (CHECK_ONLY) {
      drift.push(file);
      continue;
    }

    writeFileSync(dest, output.content, 'utf8');
    written.push(file);
  }

  return { target, files: targetOutputs.map((output) => basename(output.label)), drift, written };
}

function main() {
  const { outputs } = buildAgentAdapterOutputs();
  const results = TARGETS.map((target) => deployTarget(target, outputs));

  if (CHECK_ONLY) {
    const drift = results.filter((result) => result.drift.length > 0);
    if (drift.length > 0) {
      console.error('User-level agent deployments are out of sync:');
      for (const result of drift) {
        console.error(`  - ${result.target.name}: ${result.target.destDir}`);
        for (const file of result.drift) console.error(`    - ${file}`);
      }
      console.error('Run: bun tools/deploy-agents.mjs');
      process.exit(1);
    }
    console.log(`User-level agent deployments in sync (${results.length} targets checked).`);
    return;
  }

  let totalWritten = 0;
  for (const result of results) {
    totalWritten += result.written.length;
    const action = result.written.length === 0 ? 'already up to date' : 'deployed';
    console.log(`${result.target.name}: ${action} (${result.files.length} files) -> ${result.target.destDir}`);
    for (const file of result.written) console.log(`  - ${file}`);
  }

  if (totalWritten === 0) {
    console.log('All user-level agent deployments were already current.');
  }
}

main();
