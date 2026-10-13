#!/usr/bin/env bun

/**
 * Validate every ```ssl example embedded in agent-guides/skills/, and the
 * Good / Bad examples of the rule records in rules/.
 *
 * Skill templates are the strongest signal an agent gets about what good
 * SSL looks like — a model copies the example in front of it far more
 * reliably than it follows a rule stated in prose. So an unformatted or
 * invalid example does not just fail to help, it actively teaches the
 * wrong thing. Every example in the tree was unformatted when this check
 * was written, and one was misclassifying itself as SSL; that is very
 * likely part of why agents handed back unformatted blocks.
 *
 * Each example must:
 *   - be byte-identical to what `--format` produces (skipped for .ds
 *     examples, which the formatter does not own), and
 *   - validate under the strict agent profile with no errors and no
 *     warnings.
 *
 * Rule record examples (rules/<domain>/<id>.md, `ssl` or `ssl kind=ds`
 * fences; `text` fences are illustration and skipped) must:
 *   - under ### Good: validate with no errors or warnings, and for `ssl`
 *     fences be formatter-stable;
 *   - for each `lsp:diag.X` in enforced_by: every ### Bad fence produces X
 *     and no ### Good fence does;
 *   - for each `lsp:fmt.X` in enforced_by: formatting every ### Bad `ssl`
 *     fence changes it.
 * --fix never rewrites rule records.
 *
 * Usage:
 *   bun tools/check-skill-examples.mjs          # report and exit non-zero on failure
 *   bun tools/check-skill-examples.mjs --fix    # rewrite examples to formatter output
 */

import { execFileSync } from 'child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { loadRules, RulesError } from './lib/rules.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const SKILLS_DIR = resolve(REPO_ROOT, 'agent-guides/skills');
const FIX = process.argv.includes('--fix');

function lspBinary() {
  const arch = process.arch === 'x64' ? 'amd64' : process.arch;
  const name =
    process.platform === 'win32'
      ? `starlims-lsp-windows-${arch}.exe`
      : `starlims-lsp-${process.platform}-${arch}`;
  return resolve(REPO_ROOT, 'ssl-mcp-server/bin/lsp', name);
}

const BIN = lspBinary();

if (!existsSync(BIN)) {
  console.error(
    `starlims-lsp binary not found at ${BIN}.\n` +
      `This check drives the real formatter and validator, so it needs the\n` +
      `binary. Run "bun run fetch-lsp" in ssl-mcp-server/ first (in CI, this\n` +
      `step must come after the fetch-lsp step).`
  );
  process.exit(1);
}

const VALIDATE_ARGS = ['--validate', '--info', '--hungarian-types', '--strict'];

function validate(file) {
  const result = JSON.parse(runLsp([...VALIDATE_ARGS, file]))[0];
  return result.diagnostics ?? [];
}

function runLsp(args) {
  try {
    return execFileSync(BIN, args, { encoding: 'utf8' });
  } catch (error) {
    // --validate exits 1 when a document has errors; stdout still holds
    // the JSON we want.
    if (error.stdout) return error.stdout;
    throw error;
  }
}

// A data-source example is classified by its .ds extension, which decides
// whether its body is read as SQL or SSL.
function suffixFor(skill) {
  return skill === 'ssl-new-datasource' ? '.ds' : '.ssl';
}

const scratch = mkdtempSync(resolve(tmpdir(), 'ssl-skill-examples-'));
const failures = [];
let checked = 0;
let fixed = 0;

for (const skill of readdirSync(SKILLS_DIR).sort()) {
  const path = resolve(SKILLS_DIR, skill, 'SKILL.md');
  let source;
  try {
    source = readFileSync(path, 'utf8');
  } catch {
    continue;
  }

  const suffix = suffixFor(skill);
  const blocks = [...source.matchAll(/```ssl\n([\s\S]*?)```/g)];
  let updated = source;

  for (const [index, match] of blocks.entries()) {
    const body = match[1];
    if (!body.trim()) continue;
    checked += 1;

    const file = resolve(scratch, `${skill}-${index}${suffix}`);
    writeFileSync(file, body);
    const label = `${skill} block ${index}`;

    // 1. Formatter-stable. The formatter does not own data-source layout.
    if (suffix === '.ssl') {
      const formatted = runLsp(['--format', file]);
      if (formatted && formatted !== body) {
        if (FIX) {
          updated = updated.replace(body, formatted);
          writeFileSync(file, formatted);
          fixed += 1;
        } else {
          failures.push(`${label}: not formatter-clean — run with --fix`);
        }
      }
    }

    // 2. Clean under the strict agent profile.
    const raw = runLsp([
      '--validate',
      '--info',
      '--hungarian-types',
      '--strict',
      file,
    ]);
    let result;
    try {
      result = JSON.parse(raw)[0];
    } catch {
      failures.push(`${label}: validator returned unparseable output`);
      continue;
    }
    for (const d of result.diagnostics ?? []) {
      if (d.severity === 'error' || d.severity === 'warning') {
        failures.push(`${label}: ${d.severity} ${d.code} — ${d.message}`);
      }
    }
  }

  if (FIX && updated !== source) writeFileSync(path, updated);
}

// Rule record examples.
let ruleChecked = 0;
let records = [];
try {
  ({ records } = loadRules());
} catch (error) {
  if (!(error instanceof RulesError)) throw error;
  failures.push(`rules/ does not load — run bun tools/generate-rules.mjs --check\n${error.message}`);
}
for (const record of records) {
  if (record.status !== 'active') continue;
  const diagCodes = record.enforced_by.filter((e) => e.startsWith('lsp:diag.')).map((e) => e.slice(9));
  const fmtCodes = record.enforced_by.filter((e) => e.startsWith('lsp:fmt.'));
  for (const kind of ['good', 'bad']) {
    for (const [index, fence] of record.examples[kind].entries()) {
      if (fence.info === 'text') continue;
      ruleChecked += 1;
      const suffix = fence.info === 'ssl kind=ds' ? '.ds' : '.ssl';
      const file = resolve(scratch, `rule-${record.id}-${kind}-${index}${suffix}`);
      writeFileSync(file, fence.code);
      const label = `${record.file}:${fence.line} (${kind})`;
      let diagnostics;
      try {
        diagnostics = validate(file);
      } catch {
        failures.push(`${label}: validator returned unparseable output`);
        continue;
      }
      const codes = new Set(diagnostics.map((d) => d.code));
      if (kind === 'good') {
        for (const d of diagnostics) {
          if (d.severity === 'error' || d.severity === 'warning') {
            failures.push(`${label}: ${d.severity} ${d.code} — ${d.message}`);
          }
        }
        for (const code of diagCodes) {
          if (codes.has(code)) failures.push(`${label}: good example produces ${code}`);
        }
        if (suffix === '.ssl') {
          const formatted = runLsp(['--format', file]);
          if (formatted && formatted !== fence.code) failures.push(`${label}: not formatter-clean`);
        }
      } else {
        for (const code of diagCodes) {
          if (!codes.has(code)) failures.push(`${label}: bad example does not produce ${code}`);
        }
        if (fmtCodes.length > 0 && suffix === '.ssl') {
          const formatted = runLsp(['--format', file]);
          if (!formatted || formatted === fence.code) {
            failures.push(`${label}: formatter leaves the bad example unchanged (${fmtCodes.join(', ')})`);
          }
        }
      }
    }
  }
}

rmSync(scratch, { recursive: true, force: true });

if (FIX) {
  console.log(`Checked ${checked} skill examples, reformatted ${fixed}.`);
}
if (failures.length > 0) {
  console.error(`\n${failures.length} example problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error(
    '\nSkill examples are what agents copy. An unformatted or invalid one\n' +
      'teaches the wrong thing more effectively than the prose corrects it.'
  );
  process.exit(1);
}
console.log(`All ${checked} skill SSL examples are formatter-clean and validate clean.`);
console.log(`All ${ruleChecked} rule record examples behave as their records state.`);
