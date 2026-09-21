#!/usr/bin/env bun

/**
 * Assert the invariants the generated agent adapters must hold.
 *
 * `generate-agents.mjs --check` only proves an adapter matches its
 * canonical source. It cannot tell you the source is wrong. These are the
 * properties that, when they broke, broke silently:
 *
 *   - `ssl-orchestrator` shipped for months of a session unable to
 *     dispatch anything in VS Code, because the Copilot adapter needs
 *     BOTH the `agent` tool and an `agents:` list and had neither. The
 *     agent's whole purpose is delegation; nothing detected that it
 *     could not.
 *   - `ssl-developer` was `mode: primary`, which in opencode means "not
 *     available as a subagent" — so the orchestrator could not have
 *     reached it even where dispatch worked.
 *   - Retired agents (`ssl-refactorer`, `ssl-verifier`) lingered in
 *     handoff and prose references after being deleted.
 *
 * Usage:  bun tools/check-agent-contract.mjs
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import YAML from '../ssl-mcp-server/node_modules/yaml/dist/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CANON = resolve(ROOT, 'agent-guides/agents');

// Agents whose read-only boundary is an architectural property, not
// something inferred from their own frontmatter. Deriving "is read-only"
// from the file under test makes the check self-referential: granting
// the agent `edit` would simply switch the assertion off. These are
// named so that loosening one is a deliberate edit here.
const MUST_BE_READ_ONLY = new Set(['ssl-reviewer']);

const failures = [];
const fail = (m) => failures.push(m);

function frontmatter(path) {
  const raw = readFileSync(path, 'utf8');
  if (!raw.startsWith('---\n')) return { fm: null, body: raw };
  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) return { fm: null, body: raw };
  return { fm: YAML.parse(raw.slice(4, end)), body: raw.slice(end + 5) };
}

const names = readdirSync(CANON)
  .filter((n) => n.endsWith('.agent.md'))
  .map((n) => n.replace(/\.agent\.md$/, ''))
  .sort();

if (names.length === 0) fail('no canonical agents found');
const known = new Set(names);

for (const name of names) {
  const { fm: canon, body: canonBody } = frontmatter(resolve(CANON, `${name}.agent.md`));
  if (!canon) {
    fail(`${name}: canonical file has no frontmatter`);
    continue;
  }

  const adapters = {
    claude: resolve(ROOT, `.claude/agents/${name}.md`),
    copilot: resolve(ROOT, `.github/agents/${name}.agent.md`),
    opencode: resolve(ROOT, `.opencode/agents/${name}.md`),
  };
  for (const [dialect, path] of Object.entries(adapters)) {
    if (!existsSync(path)) {
      fail(`${name}: missing ${dialect} adapter — run bun tools/generate-agents.mjs`);
      continue;
    }
    const { fm, body } = frontmatter(path);

    // 1. Partials must be expanded. A surviving marker means the body
    //    ships the literal token to the model.
    if (/\{\{shared:[a-z0-9-]+\}\}/.test(body)) {
      fail(`${name} (${dialect}): an unexpanded {{shared:...}} marker reached the adapter`);
    }

    // 2. Every adapter carries an editing/searching protocol.
    if (!/##\s+Editing and searching/.test(body)) {
      fail(`${name} (${dialect}): no editing/searching protocol in the body`);
    }

    // 3. VS Code gets the one-edit-per-call rule specifically — it is
    //    the harness with the known multi-edit defect.
    if (dialect === 'copilot' && !/One edit per call/.test(body)) {
      fail(`${name} (copilot): missing the one-edit-per-call rule`);
    }

    // 4. No adapter may reference an agent that does not exist.
    for (const ref of body.match(/`ssl-[a-z]+`/g) ?? []) {
      const target = ref.slice(1, -1);
      if (target.startsWith('ssl-') && !known.has(target) && target !== `ssl-${name}`) {
        // Only flag things shaped like our agent names.
        if (/^ssl-(planner|developer|reviewer|handoff|docwriter|orchestrator|refactorer|verifier)$/.test(target)) {
          fail(`${name} (${dialect}): references retired or unknown agent '${target}'`);
        }
      }
    }

    // 5. Delegation needs BOTH halves in VS Code, or it silently does
    //    nothing. This is the orchestrator's entire job.
    if (dialect === 'copilot') {
      const tools = fm?.tools ?? [];
      const declared = canon.delegates ?? [];
      if (declared.length > 0) {
        if (!tools.includes('agent')) {
          fail(`${name} (copilot): declares delegates but the 'agent' tool is absent — delegation is inert`);
        }
        if (!Array.isArray(fm?.agents) || fm.agents.length === 0) {
          fail(`${name} (copilot): declares delegates but emits no 'agents:' list — delegation is inert`);
        }
        for (const d of declared) {
          if (!known.has(d)) fail(`${name}: delegate '${d}' is not an agent`);
          if (!(fm?.agents ?? []).includes(d)) fail(`${name} (copilot): delegate '${d}' missing from agents:`);
        }
      }
    }

    // 6. Read-only agents keep a hard allowlist everywhere; the boundary
    //    is load-bearing, not advisory.
    const readOnly = !(canon.tools ?? []).includes('edit');
    if (readOnly) {
      if (dialect === 'claude' && typeof fm?.tools !== 'string') {
        fail(`${name} (claude): read-only agent must carry an explicit tools allowlist`);
      }
      if (dialect === 'claude' && /(^|,\s*)(Edit|Write)(,|$)/.test(fm?.tools ?? '')) {
        fail(`${name} (claude): read-only agent was granted Edit/Write`);
      }
      if (dialect === 'opencode') {
        if (fm?.tools?.edit !== false || fm?.tools?.write !== false) {
          fail(`${name} (opencode): read-only agent does not have edit/write disabled`);
        }
        if (fm?.permission?.edit !== 'deny') {
          fail(`${name} (opencode): read-only agent lacks permission.edit: deny`);
        }
      }
    }
  }

  // 6b. An agent named read-only must still be one. Checked against the
  //     canonical manifest so the answer cannot be changed by the same
  //     edit that breaks it.
  if (MUST_BE_READ_ONLY.has(name) && (canon.tools ?? []).includes('edit')) {
    fail(`${name}: is required to be read-only but its canonical tools grant 'edit'`);
  }

  // 7. A delegate must be reachable as a subagent. opencode's `primary`
  //    means "top-level only", so a primary agent can never be dispatched.
  for (const d of canon.delegates ?? []) {
    const { fm: target } = frontmatter(resolve(CANON, `${d}.agent.md`));
    if (target?.mode === 'primary') {
      fail(`${d}: is a delegate of ${name} but mode:primary excludes it from subagent dispatch`);
    }
  }

  // 8. Handoff targets must exist (generator checks this too; kept so
  //    this file is a complete statement of the contract).
  for (const h of canon.handoffs ?? []) {
    if (!known.has(h.agent)) fail(`${name}: handoff target '${h.agent}' is not an agent`);
  }
}

// 9. Exactly one entry point, or the "which agent do I start with?"
//    problem the orchestrator exists to solve comes back.
const primaries = names.filter(
  (n) => frontmatter(resolve(CANON, `${n}.agent.md`)).fm?.mode === 'primary'
);
if (primaries.length !== 1) {
  fail(`expected exactly one mode:primary entry point, found ${primaries.length}: ${primaries.join(', ') || 'none'}`);
}

if (failures.length > 0) {
  console.error(`\n${failures.length} agent contract failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(
  `Agent contract holds for ${names.length} agents ` +
    `(${names.length * 3} adapters): partials expanded, edit protocols present, ` +
    `delegation wired, read-only boundaries enforced, one entry point.`
);
