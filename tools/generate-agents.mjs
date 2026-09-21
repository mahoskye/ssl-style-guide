#!/usr/bin/env bun

/**
 * Generate per-tool agent adapter files from the canonical, tool-neutral agent
 * definitions in agent-guides/agents/.
 *
 * Canonical source:  agent-guides/agents/<name>.agent.md  (tracked)
 * Generated outputs (all git-ignored build artifacts):
 *   .github/agents/<name>.agent.md   GitHub Copilot
 *   .opencode/agents/<name>.md       opencode
 *   .claude/agents/<name>.md         Claude Code
 *   AGENTS.md managed block          OpenAI Codex (degrades to instructions + skills)
 *
 * Usage:
 *   bun tools/generate-agents.mjs           write adapters
 *   bun tools/generate-agents.mjs --check   verify adapters are in sync (no writes)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import YAML from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const CANONICAL_DIR = resolve(REPO_ROOT, 'agent-guides/agents');
const SHARED_DIR = resolve(CANONICAL_DIR, '_shared');
const CLAUDE_DIR = resolve(REPO_ROOT, '.claude');
const AGENTS_MD = resolve(REPO_ROOT, 'AGENTS.md');
const CLAUDE_MD = resolve(CLAUDE_DIR, 'CLAUDE.md');

const CHECK_ONLY = process.argv.includes('--check');

const KNOWN_KEYS = new Set([
  'name', 'description', 'version', 'mode', 'argument-hint',
  'model', 'tools', 'mcp', 'skills', 'guides', 'handoffs', 'delegates',
  'overrides',
]);
const HANDOFF_KEYS = new Set(['label', 'agent', 'prompt', 'send', 'model']);
const REQUIRED_KEYS = ['name', 'description', 'version', 'tools'];
const NEUTRAL_TOOLS = new Set(['read', 'edit', 'grep', 'glob', 'bash:read-only']);
const VALID_MODES = new Set(['primary', 'subagent', 'all']);
// The nine tools exposed by the ssl-reference MCP server.
const VALID_SSL_REFERENCE_TOOLS = new Set([
  'ssl_lookup', 'ssl_search', 'ssl_signature', 'ssl_validate_naming',
  'ssl_style_rule', 'ssl_category', 'ssl_context_pack', 'ssl_diagnose',
  'ssl_format',
]);

const AGENTS_BEGIN = '<!-- BEGIN generated agents -->';
const AGENTS_END = '<!-- END generated agents -->';

const CLAUDE_TOOL_MAP = {
  read: ['Read'],
  edit: ['Edit', 'Write'],
  grep: ['Grep'],
  glob: ['Glob'],
  'bash:read-only': ['Bash'],
};
// VS Code custom-agents tool ids, re-verified against the docs
// 2026-09-21. Tools use namespaced names like `search/codebase`; listing
// a tool-set name (`edit`, `agent`) includes all of its tools. Delegation
// needs both the `agent` tool and an `agents:` list — the docs are
// explicit that one without the other does nothing, which is why the
// orchestrator could not dispatch in VS Code before `delegates` existed.
// See https://code.visualstudio.com/docs/copilot/customization/custom-agents
const COPILOT_TOOL_MAP = {
  read: ['read/readFile', 'search/codebase', 'search/listDirectory', 'search/usages'],
  edit: ['edit'],
  grep: ['search/textSearch'],
  glob: ['search/fileSearch'],
  'bash:read-only': ['execute/runInTerminal', 'read/terminalLastCommand'],
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
  if (manifest.mcp !== undefined) {
    if (!Array.isArray(manifest.mcp)) {
      fail(`${sourceRel}: mcp must be a list`);
    }
    for (const [i, entry] of manifest.mcp.entries()) {
      if (!entry || typeof entry !== 'object') {
        fail(`${sourceRel}: mcp[${i}] must be a mapping`);
      }
      if (typeof entry.server !== 'string' || !entry.server.trim()) {
        fail(`${sourceRel}: mcp[${i}].server must be a non-empty string`);
      }
      if (!Array.isArray(entry.tools) || entry.tools.length === 0) {
        fail(`${sourceRel}: mcp[${i}].tools must be a non-empty list`);
      }
      for (const tool of entry.tools) {
        if (typeof tool !== 'string' || !tool.trim()) {
          fail(`${sourceRel}: mcp[${i}].tools entries must be non-empty strings`);
        }
        if (entry.server === 'ssl-reference' && !VALID_SSL_REFERENCE_TOOLS.has(tool)) {
          fail(
            `${sourceRel}: mcp[${i}] tool '${tool}' is not a valid ssl-reference ` +
            `tool (allowed: ${[...VALID_SSL_REFERENCE_TOOLS].join(', ')})`
          );
        }
      }
    }
  }
  if (manifest.handoffs !== undefined) {
    if (!Array.isArray(manifest.handoffs) || manifest.handoffs.length === 0) {
      fail(`${sourceRel}: handoffs must be a non-empty list`);
    }
    for (const [i, handoff] of manifest.handoffs.entries()) {
      if (!handoff || typeof handoff !== 'object') {
        fail(`${sourceRel}: handoffs[${i}] must be a mapping`);
      }
      for (const key of Object.keys(handoff)) {
        if (!HANDOFF_KEYS.has(key)) {
          fail(`${sourceRel}: handoffs[${i}] has unknown key '${key}'`);
        }
      }
      if (typeof handoff.label !== 'string' || !handoff.label.trim()) {
        fail(`${sourceRel}: handoffs[${i}].label must be a non-empty string`);
      }
      if (typeof handoff.agent !== 'string' || !handoff.agent.trim()) {
        fail(`${sourceRel}: handoffs[${i}].agent must be a non-empty string`);
      }
      if (handoff.send !== undefined && typeof handoff.send !== 'boolean') {
        fail(`${sourceRel}: handoffs[${i}].send must be a boolean`);
      }
    }
  }

  return { manifest, body: body.trim(), sourceRel };
}

function validateHandoffTargets(agents) {
  const known = new Set(agents.map((a) => a.manifest.name));
  for (const { manifest, sourceRel } of agents) {
    for (const handoff of manifest.handoffs ?? []) {
      if (!known.has(handoff.agent)) {
        fail(
          `${sourceRel}: handoff target agent '${handoff.agent}' is not a ` +
          `canonical agent (known: ${[...known].join(', ')})`
        );
      }
      if (handoff.agent === manifest.name) {
        fail(`${sourceRel}: handoff target agent '${handoff.agent}' is self-referential`);
      }
    }
    for (const delegate of manifest.delegates ?? []) {
      if (!known.has(delegate)) {
        fail(
          `${sourceRel}: delegate '${delegate}' is not a canonical agent ` +
          `(known: ${[...known].join(', ')})`
        );
      }
      if (delegate === manifest.name) {
        fail(`${sourceRel}: delegate '${delegate}' is self-referential`);
      }
    }
  }
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
  const fm = {
    name: manifest.name,
    description: oneLine(manifest.description),
  };
  // Edit-capable agents run permissive in Claude Code: omitting `tools`
  // inherits the session's full toolset (Skill, task tracking, Agent, MCP).
  // Read-only agents keep a hard allowlist — that boundary is load-bearing —
  // plus `Skill` so they can invoke their registered workflow skills.
  if (!manifest.tools.includes('edit')) {
    const tools = [
      ...mapTools(manifest.tools, CLAUDE_TOOL_MAP),
      'Skill',
      ...mcpToolNames(manifest),
    ];
    fm.tools = tools.join(', ');
  }
  if (manifest.skills) fm.skills = manifest.skills;
  if (manifest['argument-hint']) fm['argument-hint'] = manifest['argument-hint'];
  if (manifest.model && manifest.model !== 'inherit') fm.model = manifest.model;
  Object.assign(fm, manifest.overrides?.claude ?? {});
  return fm;
}

function copilotMcpToolNames(manifest) {
  // VS Code custom-agents MCP syntax: `<server>/<tool>` or `<server>/*` for all.
  const names = [];
  for (const entry of manifest.mcp ?? []) {
    for (const tool of entry.tools ?? []) {
      names.push(`${entry.server}/${tool}`);
    }
  }
  return names;
}

function copilotFrontmatter(manifest) {
  const delegates = manifest.delegates ?? [];
  const fm = {
    name: manifest.name,
    description: oneLine(manifest.description),
    tools: [
      ...mapTools(manifest.tools, COPILOT_TOOL_MAP),
      ...(delegates.length > 0 ? ['agent'] : []),
      ...copilotMcpToolNames(manifest),
    ],
  };
  if (delegates.length > 0) fm.agents = [...delegates];
  if (manifest['argument-hint']) fm['argument-hint'] = manifest['argument-hint'];
  if (manifest.model && manifest.model !== 'inherit') fm.model = manifest.model;
  if (manifest.handoffs) fm.handoffs = manifest.handoffs;
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
  // Mirror disabled capabilities in opencode's permission model so read-only
  // roles are enforced by the harness, not just by prompt prose.
  const permission = {};
  if (!enabled.edit) permission.edit = 'deny';
  if (!enabled.bash) permission.bash = 'deny';
  if (Object.keys(permission).length > 0) fm.permission = permission;
  Object.assign(fm, manifest.overrides?.opencode ?? {});
  return fm;
}

// opencode registers MCP tools as `<server>_<tool>`; guides refer to bare
// tool names. Weak models have invented wrong separators (e.g.
// `ssl-reference-ssl_lookup`), so spell the exact callable names out.
function opencodeBody(manifest, body) {
  if (!manifest.mcp?.length) return body;
  const lines = ['## MCP tool names in opencode', ''];
  for (const entry of manifest.mcp) {
    lines.push(
      `The \`${entry.server}\` MCP tools are registered here as ` +
      `\`${entry.server}_<tool>\` (underscore). These are tool invocations, ` +
      'not shell commands — never run them through bash. When this guide ' +
      'names a bare tool, invoke the prefixed tool:',
      '',
      ...entry.tools.map((t) => `- \`${t}\` → \`${entry.server}_${t}\``),
      '',
    );
  }
  return `${lines.join('\n')}\n${body}`;
}

// A body line that is exactly `{{shared:<name>}}` is replaced by
// `_shared/<name>.md`. Seven agents previously carried near-identical
// copies of the sources-of-truth and MCP-fallback blocks; every copy was
// prompt budget spent restating what the others already said, and they
// drifted apart as agents were edited one at a time. Factoring them out
// keeps each agent file down to what makes that agent different.
const SHARED_RE = /^[ \t]*\{\{shared:([a-z0-9-]+)\}\}[ \t]*$/;

function expandShared(body, sourceRel, seen = []) {
  return body
    .split('\n')
    .map((line) => {
      const match = SHARED_RE.exec(line);
      if (!match) return line;
      const name = match[1];
      if (seen.includes(name)) {
        fail(`${sourceRel}: shared partial cycle via {{shared:${name}}}`);
      }
      const path = resolve(SHARED_DIR, `${name}.md`);
      if (!existsSync(path)) {
        fail(
          `${sourceRel}: {{shared:${name}}} has no partial at ` +
          `agent-guides/agents/_shared/${name}.md`
        );
      }
      const partial = readFileSync(path, 'utf8').replace(/\n+$/, '');
      return expandShared(partial, sourceRel, [...seen, name]);
    })
    .join('\n');
}

// Per-dialect file-editing protocol. The neutral body says *what* to do;
// this says how to do it in the harness the adapter targets, because the
// failure modes are harness-specific and cost real work when they hit.
//
// VS Code has a known agent-mode defect (microsoft/vscode #253561,
// #256296, #260410 and vscode-copilot-release #8070): an edit applies
// correctly, the agent fails to detect its own change, retries the same
// edit by another route, and after a few attempts deletes and recreates
// the file from scratch. A recreated file loses the formatting and
// comments it was told to preserve. The protocol below cannot fix the
// defect, but it keeps the blast radius to one hunk and denies the
// model the whole-file rewrite as an automatic escape hatch. Unscoped
// workspace text search is the other known stall; a scoped search or a
// direct read of a known path is always cheaper.
const EDIT_PROTOCOL = {
  copilot: [
    '## Editing and searching in VS Code',
    '',
    '**One edit per call.** Apply changes to a file one hunk at a time and',
    're-read the file to confirm each landed before starting the next.',
    'A file needing eight changes takes eight calls.',
    '',
    'This is not pedantry. VS Code agent mode has a known defect where an',
    'edit applies correctly, the agent does not see its own change, and it',
    'retries — eventually recreating the file from scratch and losing the',
    'formatting and comments it was told to preserve. **Verify by reading',
    'the file, never by trusting the tool result**, and treat a',
    '"no change applied" report as a claim to check rather than a fact.',
    '',
    '**A whole-file write is a decision, never a retry.** Rewrite a file',
    'only when you have decided its structure must change, and say so in',
    'the report. If an edit genuinely did not land, re-read the current',
    'text and retry that one hunk with a longer unique anchor. Never let a',
    'failed edit escalate into replacing the file.',
    '',
    '**Scope every search.** An unscoped workspace-wide text search stalls',
    'on a LIMS workspace. Read the path directly when you know it; use',
    'codebase search for "where is X handled?"; use text search only for an',
    'exact token, always narrowed to a directory or glob. If two searches',
    'have not found it, ask rather than widening the third.',
    '',
  ].join('\n'),
  claude: [
    '## Editing and searching',
    '',
    '**A whole-file write is a decision, never a retry.** Rewrite a file',
    'only when you have decided its structure must change, and say so in',
    'the report. If an Edit fails, re-read the exact current text and retry',
    'that one hunk with a longer unique anchor — a failed edit means your',
    'anchor was stale or ambiguous, not that the file needs replacing. A',
    'rewrite that sheds working substance to reach clean syntax is a',
    'regression, not a fix.',
    '',
    '**Scope every search.** Read the path directly when you know it; use',
    'Glob to locate files by name and Grep for an exact token, narrowed to',
    'a path. If two searches have not found it, ask rather than widening',
    'the third.',
    '',
  ].join('\n'),
};

function withEditProtocol(body, dialect) {
  const block = EDIT_PROTOCOL[dialect];
  return block ? `${body.replace(/\n+$/, '')}\n\n${block}` : body;
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
  for (const { manifest, body: rawBody, sourceRel } of agents) {
    const { name, version } = manifest;
    const body = expandShared(rawBody, sourceRel);
    outputs.push({
      label: `.github/agents/${name}.agent.md`,
      path: resolve(REPO_ROOT, `.github/agents/${name}.agent.md`),
      content: renderAdapter(
        copilotFrontmatter(manifest),
        withEditProtocol(body, 'copilot'),
        sourceRel,
        version
      ),
      local: false,
    });
    outputs.push({
      label: `.opencode/agents/${name}.md`,
      path: resolve(REPO_ROOT, `.opencode/agents/${name}.md`),
      content: renderAdapter(
        opencodeFrontmatter(manifest),
        opencodeBody(manifest, withEditProtocol(body, 'claude')),
        sourceRel,
        version
      ),
      local: false,
    });
    outputs.push({
      label: `.claude/agents/${name}.md`,
      path: resolve(REPO_ROOT, `.claude/agents/${name}.md`),
      content: renderAdapter(
        claudeFrontmatter(manifest),
        withEditProtocol(body, 'claude'),
        sourceRel,
        version
      ),
      local: true,
    });
  }
  return outputs;
}

export function buildAgentAdapterOutputs() {
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
  validateHandoffTargets(agents);
  return { agents, outputs: planOutputs(agents) };
}

function readIfExists(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

function main() {
  const { agents, outputs } = buildAgentAdapterOutputs();
  const claudePresent = existsSync(CLAUDE_DIR);

  // Adapter files. All adapters are git-ignored build artifacts.
  const drift = [];
  const written = [];

  for (const output of outputs) {
    const current = readIfExists(output.path);
    if (CHECK_ONLY) {
      // Only flag adapters that exist on disk and have drifted — a not-yet-
      // generated adapter (e.g. a fresh clone) is not drift.
      if (current !== null && current !== output.content) {
        drift.push(output.label);
      }
      continue;
    }
    if (output.local && !claudePresent) {
      continue; // .claude/ absent (e.g. fresh clone) — skip the Claude adapter.
    }
    if (current === output.content) continue;
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
