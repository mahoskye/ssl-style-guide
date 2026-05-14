#!/usr/bin/env bun

/**
 * Generate per-tool agent adapter files from the canonical, tool-neutral agent
 * definitions in agent-guides/agents/.
 *
 * Canonical source:  agent-guides/agents/<name>.agent.md
 * Generated outputs:
 *   .github/agents/<name>.agent.md   GitHub Copilot      (committed)
 *   .opencode/agent/<name>.md        opencode            (committed)
 *   .claude/agents/<name>.md         Claude Code         (git-ignored, local-only)
 *   AGENTS.md managed block          OpenAI Codex        (git-ignored, local-only)
 *
 * Usage:
 *   bun tools/generate-agents.mjs           write adapters
 *   bun tools/generate-agents.mjs --check   verify adapters are in sync (no writes)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const CANONICAL_DIR = resolve(REPO_ROOT, 'agent-guides/agents');
const CLAUDE_DIR = resolve(REPO_ROOT, '.claude');
const AGENTS_MD = resolve(REPO_ROOT, 'AGENTS.md');
const CLAUDE_MD = resolve(CLAUDE_DIR, 'CLAUDE.md');

const CHECK_ONLY = process.argv.includes('--check');

const KNOWN_KEYS = new Set([
  'name', 'description', 'version', 'mode', 'argument-hint',
  'model', 'tools', 'mcp', 'skills', 'guides', 'overrides',
]);
const REQUIRED_KEYS = ['name', 'description', 'version', 'tools'];
const NEUTRAL_TOOLS = new Set(['read', 'edit', 'grep', 'glob', 'bash:read-only']);
const VALID_MODES = new Set(['primary', 'subagent', 'all']);

const AGENTS_BEGIN = '<!-- BEGIN generated agents -->';
const AGENTS_END = '<!-- END generated agents -->';

const CLAUDE_TOOL_MAP = {
  read: ['Read'],
  edit: ['Edit', 'Write'],
  grep: ['Grep'],
  glob: ['Glob'],
  'bash:read-only': ['Bash'],
};
const COPILOT_TOOL_MAP = {
  read: ['search', 'codebase'],
  edit: ['editFiles'],
  grep: ['search'],
  glob: ['search'],
  'bash:read-only': ['runCommands'],
};

function fail(message) {
  throw new Error(message);
}

function oneLine(text) {
  return String(text).replace(/\s+/g, ' ').trim();
}

function splitFrontmatter(raw, sourceRel) {
  if (!raw.startsWith('---\n')) {
    fail(`${sourceRel}: missing YAML frontmatter`);
  }
  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) {
    fail(`${sourceRel}: unterminated YAML frontmatter`);
  }
  return { frontmatter: raw.slice(4, end), body: raw.slice(end + 5) };
}

function loadManifest(fileName) {
  const sourceRel = `agent-guides/agents/${fileName}`;
  const raw = readFileSync(resolve(CANONICAL_DIR, fileName), 'utf8');
  const { frontmatter, body } = splitFrontmatter(raw, sourceRel);

  let manifest;
  try {
    manifest = YAML.parse(frontmatter);
  } catch (error) {
    return fail(`${sourceRel}: invalid YAML frontmatter — ${error.message}`);
  }
  if (!manifest || typeof manifest !== 'object') {
    fail(`${sourceRel}: frontmatter must be a mapping`);
  }

  for (const key of Object.keys(manifest)) {
    if (!KNOWN_KEYS.has(key)) {
      fail(`${sourceRel}: unknown manifest key '${key}'`);
    }
  }
  for (const key of REQUIRED_KEYS) {
    if (manifest[key] === undefined) {
      fail(`${sourceRel}: missing required key '${key}'`);
    }
  }

  const stem = fileName.replace(/\.agent\.md$/, '');
  if (manifest.name !== stem) {
    fail(`${sourceRel}: name '${manifest.name}' must match filename stem '${stem}'`);
  }
  if (!/^[a-z0-9-]+$/.test(manifest.name)) {
    fail(`${sourceRel}: name must be lowercase letters, digits, and hyphens`);
  }
  if (!Number.isInteger(manifest.version)) {
    fail(`${sourceRel}: version must be an integer`);
  }
  if (manifest.mode !== undefined && !VALID_MODES.has(manifest.mode)) {
    fail(`${sourceRel}: invalid mode '${manifest.mode}'`);
  }
  if (!Array.isArray(manifest.tools) || manifest.tools.length === 0) {
    fail(`${sourceRel}: tools must be a non-empty list`);
  }
  for (const tool of manifest.tools) {
    if (!NEUTRAL_TOOLS.has(tool)) {
      fail(`${sourceRel}: unknown tool token '${tool}'`);
    }
  }
  for (const skill of manifest.skills ?? []) {
    if (!existsSync(resolve(REPO_ROOT, `agent-guides/skills/${skill}/SKILL.md`))) {
      fail(`${sourceRel}: skill '${skill}' has no agent-guides/skills/${skill}/SKILL.md`);
    }
  }
  for (const guide of manifest.guides ?? []) {
    if (!existsSync(resolve(REPO_ROOT, guide))) {
      fail(`${sourceRel}: guide path '${guide}' does not exist`);
    }
  }

  return { manifest, body: body.trim(), sourceRel };
}

function mapTools(tools, map) {
  const out = [];
  for (const tool of tools) {
    for (const mapped of map[tool]) {
      if (!out.includes(mapped)) out.push(mapped);
    }
  }
  return out;
}

function mcpToolNames(manifest) {
  const names = [];
  for (const entry of manifest.mcp ?? []) {
    for (const tool of entry.tools ?? []) {
      names.push(`mcp__${entry.server}__${tool}`);
    }
  }
  return names;
}

function claudeFrontmatter(manifest) {
  const tools = [...mapTools(manifest.tools, CLAUDE_TOOL_MAP), ...mcpToolNames(manifest)];
  const fm = {
    name: manifest.name,
    description: oneLine(manifest.description),
    tools: tools.join(', '),
  };
  if (manifest.skills) fm.skills = manifest.skills;
  if (manifest['argument-hint']) fm['argument-hint'] = manifest['argument-hint'];
  if (manifest.model && manifest.model !== 'inherit') fm.model = manifest.model;
  Object.assign(fm, manifest.overrides?.claude ?? {});
  return fm;
}

function copilotFrontmatter(manifest) {
  const fm = {
    name: manifest.name,
    description: oneLine(manifest.description),
    tools: mapTools(manifest.tools, COPILOT_TOOL_MAP),
  };
  if (manifest['argument-hint']) fm['argument-hint'] = manifest['argument-hint'];
  if (manifest.model && manifest.model !== 'inherit') fm.model = manifest.model;
  Object.assign(fm, manifest.overrides?.copilot ?? {});
  return fm;
}

function opencodeFrontmatter(manifest) {
  const enabled = {
    read: false, grep: false, glob: false, edit: false, write: false, bash: false,
  };
  for (const tool of manifest.tools) {
    if (tool === 'read') enabled.read = true;
    else if (tool === 'grep') enabled.grep = true;
    else if (tool === 'glob') enabled.glob = true;
    else if (tool === 'edit') { enabled.edit = true; enabled.write = true; }
    else if (tool === 'bash:read-only') enabled.bash = true;
  }
  const fm = {
    description: oneLine(manifest.description),
    mode: manifest.mode ?? 'all',
  };
  if (manifest.model && manifest.model !== 'inherit') fm.model = manifest.model;
  fm.tools = enabled;
  Object.assign(fm, manifest.overrides?.opencode ?? {});
  return fm;
}

function renderAdapter(frontmatter, body, sourceRel, version) {
  const yaml = YAML.stringify(frontmatter, { lineWidth: 0 }).trimEnd();
  const header =
    `<!-- GENERATED from ${sourceRel} v${version}. Do not edit. ` +
    'Run: bun tools/generate-agents.mjs -->';
  return `---\n${yaml}\n---\n${header}\n\n${body}\n`;
}

function renderAgentsBlock(agents) {
  const lines = [
    AGENTS_BEGIN,
    'Canonical agent definitions live in `agent-guides/agents/`. Regenerate the',
    'per-tool adapters with `bun tools/generate-agents.mjs`.',
    '',
  ];
  for (const { manifest } of agents) {
    lines.push(`- \`${manifest.name}\` — ${oneLine(manifest.description)}`);
  }
  lines.push(AGENTS_END);
  return lines.join('\n');
}

function planOutputs(agents) {
  const outputs = [];
  for (const { manifest, body, sourceRel } of agents) {
    const { name, version } = manifest;
    outputs.push({
      label: `.github/agents/${name}.agent.md`,
      path: resolve(REPO_ROOT, `.github/agents/${name}.agent.md`),
      content: renderAdapter(copilotFrontmatter(manifest), body, sourceRel, version),
      local: false,
    });
    outputs.push({
      label: `.opencode/agent/${name}.md`,
      path: resolve(REPO_ROOT, `.opencode/agent/${name}.md`),
      content: renderAdapter(opencodeFrontmatter(manifest), body, sourceRel, version),
      local: false,
    });
    outputs.push({
      label: `.claude/agents/${name}.md`,
      path: resolve(REPO_ROOT, `.claude/agents/${name}.md`),
      content: renderAdapter(claudeFrontmatter(manifest), body, sourceRel, version),
      local: true,
    });
  }
  return outputs;
}

function readIfExists(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

function main() {
  if (!existsSync(CANONICAL_DIR)) {
    fail(`Canonical agent directory not found: ${CANONICAL_DIR}`);
  }
  const files = readdirSync(CANONICAL_DIR)
    .filter((name) => name.endsWith('.agent.md'))
    .sort();
  if (files.length === 0) {
    fail(`No *.agent.md files in ${CANONICAL_DIR}`);
  }
  const agents = files.map(loadManifest);
  const claudePresent = existsSync(CLAUDE_DIR);

  // Adapter files.
  const outputs = planOutputs(agents);
  const drift = [];
  const written = [];

  for (const output of outputs) {
    if (output.local && !claudePresent) {
      continue; // .claude/ absent (e.g. fresh clone) — local-only adapter, skip.
    }
    const current = readIfExists(output.path);
    if (current === output.content) continue;
    if (CHECK_ONLY) {
      drift.push(output.label);
      continue;
    }
    mkdirSync(dirname(output.path), { recursive: true });
    writeFileSync(output.path, output.content, 'utf8');
    written.push(output.label);
  }

  // AGENTS.md managed block — local-only (AGENTS.md is git-ignored).
  if (existsSync(AGENTS_MD)) {
    const current = readFileSync(AGENTS_MD, 'utf8');
    const beginAt = current.indexOf(AGENTS_BEGIN);
    const endAt = current.indexOf(AGENTS_END);
    if (beginAt === -1 || endAt === -1) {
      console.warn(
        `warning: AGENTS.md is missing the '${AGENTS_BEGIN}' / '${AGENTS_END}' ` +
        'markers; skipping the Codex agents block.'
      );
    } else {
      const next =
        current.slice(0, beginAt) +
        renderAgentsBlock(agents) +
        current.slice(endAt + AGENTS_END.length);
      if (next !== current) {
        if (CHECK_ONLY) {
          drift.push('AGENTS.md (managed agents block)');
        } else {
          writeFileSync(AGENTS_MD, next, 'utf8');
          written.push('AGENTS.md (managed agents block)');
        }
      }
    }
  }

  // .claude/CLAUDE.md — created once if absent; never overwritten or drift-checked.
  if (!CHECK_ONLY && claudePresent && !existsSync(CLAUDE_MD)) {
    writeFileSync(
      CLAUDE_MD,
      '# CLAUDE.md\n\n@AGENTS.md\n\n' +
      '## SSL agents\n\n' +
      'Agents are generated into `.claude/agents/` from `agent-guides/agents/`.\n' +
      'Regenerate with `bun tools/generate-agents.mjs`.\n',
      'utf8'
    );
    written.push('.claude/CLAUDE.md (created)');
  }

  if (CHECK_ONLY) {
    if (drift.length > 0) {
      console.error('Agent adapters are out of sync with agent-guides/agents/:');
      for (const label of drift) console.error(`  - ${label}`);
      console.error('Run: bun tools/generate-agents.mjs');
      process.exit(1);
    }
    console.log(`Agent adapters in sync (${agents.length} agents checked).`);
    return;
  }

  if (written.length === 0) {
    console.log(`Agent adapters already up to date (${agents.length} agents).`);
    return;
  }
  console.log(`Generated adapters for ${agents.length} agents:`);
  for (const label of written) console.log(`  - ${label}`);
}

main();
