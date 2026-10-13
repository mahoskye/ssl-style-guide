/**
 * Loader, validator and renderers for the rules source in rules/.
 *
 * Each rule is one Markdown file, rules/<domain>/<id>.md: strict YAML
 * frontmatter, then fixed `##` sections. See rules/README.md for the format
 * and docs/design/rules-source.md for the design.
 *
 * Shared by tools/generate-rules.mjs (schema region, Markdown regions,
 * rules/INDEX.md, checks), tools/generate-machine-docs.mjs (category-pack
 * rule lists and foundation bullets) and tools/check-skill-examples.mjs
 * (executable examples).
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { dirname, relative, resolve } from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(__dirname, '../..');
export const RULES_DIR = resolve(REPO_ROOT, 'rules');
export const CATEGORIES_PATH = resolve(RULES_DIR, 'categories.yaml');
export const ELEMENT_REFERENCE_PATH = resolve(REPO_ROOT, 'ssl-style-guide/ssl-element-reference.json');

export const DOMAINS = ['language', 'server-scripts', 'data-sources', 'sql', 'classes', 'naming'];
export const STATUSES = ['draft', 'active', 'deprecated', 'removed'];
export const LEVELS = ['authoritative', 'style_only', 'advisory'];
export const SEVERITIES = ['error', 'warning', 'info', 'hint'];
export const APPLIES_TO = ['server_script', 'class', 'ssl_data_source', 'sql_data_source', 'embedded_sql'];
export const MACHINE_LISTS = ['must_follow', 'avoid'];
export const FOUNDATION_LISTS = ['non_negotiable', 'does_not_have'];
export const SCHEMA_FORMS = ['lint', 'rule_text', 'value'];
export const VERIFICATION_BASES = ['reference', 'observed', 'convention'];
export const FENCE_KINDS = ['ssl', 'ssl kind=ds', 'text'];

const REQUIRED_FIELDS = [
  'id', 'title', 'domain', 'status', 'level', 'severity', 'applies_to',
  'rule', 'categories', 'enforced_by', 'verification',
];
const OPTIONAL_FIELDS = ['machine', 'related_elements', 'schema', 'issues', 'aliases'];
const ALLOWED_FIELDS = new Set([...REQUIRED_FIELDS, ...OPTIONAL_FIELDS]);
const SECTIONS = ['Rationale', 'Exceptions', 'Examples', 'Notes'];
const ID_RE = /^[a-z][a-z0-9_]*$/;
const ENFORCED_RE = /^(lsp:(diag|fmt)\.[a-z0-9_]+|reviewer|none)$/;

export class RulesError extends Error {
  constructor(problems) {
    super(`rules/ has ${problems.length} problem(s):\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    this.problems = problems;
  }
}

export function repoRel(path) {
  return relative(REPO_ROOT, path).split('\\').join('/');
}

/** Category ids, in pack order, and the owned categories' rule order. */
export function loadCategories() {
  const parsed = YAML.parse(readFileSync(CATEGORIES_PATH, 'utf8'), { uniqueKeys: true });
  const problems = [];
  const list = parsed?.categories;
  if (!Array.isArray(list)) {
    throw new RulesError(['rules/categories.yaml: `categories` must be a list']);
  }
  const categories = [];
  const seen = new Set();
  for (const [index, entry] of list.entries()) {
    const where = `rules/categories.yaml categories[${index}]`;
    if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string') {
      problems.push(`${where}: each category needs a string id`);
      continue;
    }
    for (const key of Object.keys(entry)) {
      if (!['id', 'lists_from_rules', 'order'].includes(key)) {
        problems.push(`${where} (${entry.id}): unknown field '${key}'`);
      }
    }
    if (seen.has(entry.id)) problems.push(`${where}: duplicate category id '${entry.id}'`);
    seen.add(entry.id);
    const owned = entry.lists_from_rules === true;
    if (owned && !Array.isArray(entry.order)) {
      problems.push(`${where} (${entry.id}): lists_from_rules needs an 'order' list of rule ids`);
    }
    if (!owned && entry.order !== undefined) {
      problems.push(`${where} (${entry.id}): 'order' is only used with lists_from_rules: true`);
    }
    categories.push({ id: entry.id, owned, order: owned ? entry.order : [] });
  }
  if (problems.length > 0) throw new RulesError(problems);
  return categories;
}

function loadElementNames() {
  const ref = JSON.parse(readFileSync(ELEMENT_REFERENCE_PATH, 'utf8'));
  const names = new Set();
  for (const bucket of ['keywords', 'operators', 'literals', 'types', 'classes', 'special_forms', 'functions']) {
    for (const name of Object.keys(ref[bucket] ?? {})) names.add(name.toLowerCase());
  }
  return names;
}

function splitFrontmatter(raw) {
  if (!raw.startsWith('---\n')) return null;
  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) return null;
  return { frontmatter: raw.slice(4, end), body: raw.slice(end + 5) };
}

/**
 * Parse the body into `##` sections and, under `## Examples`, the fences of
 * `### Good` and `### Bad`.
 */
function parseBody(body, where, problems, offset = 0) {
  const sections = new Map();
  const examples = { good: [], bad: [] };
  let section = null;
  let subsection = null;
  let fence = null;
  const lines = body.split('\n');
  for (const [bodyIndex, line] of lines.entries()) {
    const index = bodyIndex + offset;
    if (fence) {
      if (line.startsWith('```')) {
        if (section === 'Examples' && (subsection === 'Good' || subsection === 'Bad')) {
          examples[subsection.toLowerCase()].push({ info: fence.info, code: fence.lines.join('\n') + '\n', line: fence.line });
        } else {
          problems.push(`${where}:${fence.line}: code fence outside ### Good / ### Bad`);
        }
        fence = null;
      } else {
        fence.lines.push(line);
      }
      continue;
    }
    const fenceOpen = line.match(/^```(.*)$/);
    if (fenceOpen) {
      const info = fenceOpen[1].trim();
      if (!FENCE_KINDS.includes(info)) {
        problems.push(`${where}:${index + 1}: fence info string '${info}' is not one of: ${FENCE_KINDS.join(', ')}`);
      }
      fence = { info, lines: [], line: index + 1 };
      continue;
    }
    const h2 = line.match(/^## (.+)$/);
    if (h2) {
      section = h2[1].trim();
      subsection = null;
      if (!SECTIONS.includes(section)) {
        problems.push(`${where}:${index + 1}: unknown section '## ${section}' (allowed: ${SECTIONS.join(', ')})`);
      }
      if (sections.has(section)) problems.push(`${where}: duplicate section '## ${section}'`);
      sections.set(section, []);
      continue;
    }
    const h3 = line.match(/^### (.+)$/);
    if (h3) {
      subsection = h3[1].trim();
      if (section !== 'Examples' || !['Good', 'Bad'].includes(subsection)) {
        problems.push(`${where}:${index + 1}: '### ${subsection}' is only allowed as ### Good / ### Bad under ## Examples`);
      }
      continue;
    }
    if (section === null) {
      if (line.trim()) problems.push(`${where}:${index + 1}: text before the first ## section`);
      continue;
    }
    sections.get(section).push(line);
  }
  if (fence) problems.push(`${where}:${fence.line}: unterminated code fence`);
  const text = new Map([...sections].map(([name, body]) => [name, body.join('\n').trim()]));
  return { sections: text, examples };
}

function checkString(value, field, where, problems) {
  if (typeof value !== 'string' || !value.trim()) {
    problems.push(`${where}: '${field}' must be a non-empty string`);
    return false;
  }
  return true;
}

function checkEnumList(value, field, allowed, where, problems, { min = 1 } = {}) {
  if (!Array.isArray(value) || value.length < min) {
    problems.push(`${where}: '${field}' must be a list with at least ${min} entr${min === 1 ? 'y' : 'ies'}`);
    return;
  }
  const seen = new Set();
  for (const item of value) {
    if (allowed && !allowed.includes(item)) {
      problems.push(`${where}: '${field}' value '${item}' is not one of: ${allowed.join(', ')}`);
    }
    if (!allowed && typeof item !== 'string') problems.push(`${where}: '${field}' entries must be strings`);
    if (seen.has(item)) problems.push(`${where}: '${field}' lists '${item}' twice`);
    seen.add(item);
  }
}

function validateRecord(fm, file, domainDir, categoryIds, elementNames, problems) {
  const where = repoRel(file);
  if (!fm || typeof fm !== 'object' || Array.isArray(fm)) {
    problems.push(`${where}: frontmatter must be a mapping`);
    return false;
  }
  for (const key of Object.keys(fm)) {
    if (!ALLOWED_FIELDS.has(key)) problems.push(`${where}: unknown frontmatter field '${key}'`);
  }
  for (const key of REQUIRED_FIELDS) {
    if (fm[key] === undefined) problems.push(`${where}: missing required field '${key}'`);
  }
  const base = file.split('/').pop().replace(/\.md$/, '');
  if (checkString(fm.id, 'id', where, problems)) {
    if (!ID_RE.test(fm.id)) problems.push(`${where}: id '${fm.id}' must be snake_case`);
    if (fm.id !== base) problems.push(`${where}: id '${fm.id}' must equal the filename '${base}'`);
  }
  checkString(fm.title, 'title', where, problems);
  if (fm.domain !== domainDir) problems.push(`${where}: domain '${fm.domain}' must match its directory '${domainDir}'`);
  if (!STATUSES.includes(fm.status)) problems.push(`${where}: status must be one of: ${STATUSES.join(', ')}`);
  if (!LEVELS.includes(fm.level)) problems.push(`${where}: level must be one of: ${LEVELS.join(', ')}`);
  if (!SEVERITIES.includes(fm.severity)) problems.push(`${where}: severity must be one of: ${SEVERITIES.join(', ')}`);
  checkEnumList(fm.applies_to, 'applies_to', APPLIES_TO, where, problems);
  if (checkString(fm.rule, 'rule', where, problems) && fm.rule.includes('\n')) {
    problems.push(`${where}: 'rule' must be one line (use a folded >- scalar)`);
  }
  checkEnumList(fm.categories, 'categories', categoryIds, where, problems);

  if (fm.machine !== undefined) {
    const m = fm.machine;
    if (!m || typeof m !== 'object' || Array.isArray(m)) {
      problems.push(`${where}: 'machine' must be a mapping`);
    } else {
      for (const key of Object.keys(m)) {
        if (!['list', 'foundation'].includes(key)) problems.push(`${where}: unknown machine field '${key}'`);
      }
      if (!MACHINE_LISTS.includes(m.list)) problems.push(`${where}: machine.list must be one of: ${MACHINE_LISTS.join(', ')}`);
      if (m.foundation !== undefined && !FOUNDATION_LISTS.includes(m.foundation)) {
        problems.push(`${where}: machine.foundation must be one of: ${FOUNDATION_LISTS.join(', ')}`);
      }
    }
  }

  if (fm.related_elements !== undefined) {
    checkEnumList(fm.related_elements, 'related_elements', null, where, problems);
    for (const name of fm.related_elements ?? []) {
      if (typeof name === 'string' && !elementNames.has(name.toLowerCase())) {
        problems.push(`${where}: related element '${name}' is not in ssl-style-guide/ssl-element-reference.json`);
      }
    }
  }

  checkEnumList(fm.enforced_by, 'enforced_by', null, where, problems);
  for (const item of fm.enforced_by ?? []) {
    if (typeof item === 'string' && !ENFORCED_RE.test(item)) {
      problems.push(`${where}: enforced_by '${item}' must be lsp:diag.<slug>, lsp:fmt.<slug>, reviewer or none`);
    }
  }
  if (Array.isArray(fm.enforced_by) && fm.enforced_by.includes('none') && fm.enforced_by.length > 1) {
    problems.push(`${where}: enforced_by 'none' cannot be combined with other entries`);
  }

  if (fm.schema !== undefined) {
    if (!Array.isArray(fm.schema)) {
      problems.push(`${where}: 'schema' must be a list of placements`);
    } else {
      for (const [index, p] of fm.schema.entries()) {
        const pw = `${where} schema[${index}]`;
        if (!p || typeof p !== 'object') {
          problems.push(`${pw}: placement must be a mapping`);
          continue;
        }
        for (const key of Object.keys(p)) {
          if (!['path', 'form', 'message', 'value'].includes(key)) problems.push(`${pw}: unknown field '${key}'`);
        }
        checkString(p.path, 'path', pw, problems);
        if (!SCHEMA_FORMS.includes(p.form)) problems.push(`${pw}: form must be one of: ${SCHEMA_FORMS.join(', ')}`);
        if (p.form === 'value' && p.value === undefined) problems.push(`${pw}: form 'value' needs a value`);
        if (p.form !== 'value' && p.value !== undefined) problems.push(`${pw}: 'value' is only used with form 'value'`);
        if (p.form === 'value' && p.message !== undefined) problems.push(`${pw}: 'message' is not used with form 'value'`);
      }
    }
  }

  const v = fm.verification;
  if (!v || typeof v !== 'object' || Array.isArray(v)) {
    problems.push(`${where}: 'verification' must be a mapping with basis and note`);
  } else {
    for (const key of Object.keys(v)) {
      if (!['basis', 'note'].includes(key)) problems.push(`${where}: unknown verification field '${key}'`);
    }
    if (!VERIFICATION_BASES.includes(v.basis)) {
      problems.push(`${where}: verification.basis must be one of: ${VERIFICATION_BASES.join(', ')}`);
    }
    checkString(v.note, 'verification.note', where, problems);
  }
  for (const field of ['issues', 'aliases']) {
    if (fm[field] !== undefined) checkEnumList(fm[field], field, null, where, problems);
  }
  return true;
}

function listRuleFiles() {
  const files = [];
  if (!existsSync(RULES_DIR)) return files;
  for (const entry of readdirSync(RULES_DIR).sort()) {
    const dir = resolve(RULES_DIR, entry);
    if (!statSync(dir).isDirectory()) continue;
    for (const name of readdirSync(dir).sort()) {
      if (name.endsWith('.md')) files.push({ domain: entry, file: resolve(dir, name) });
    }
  }
  return files;
}

/**
 * Load and validate every record. Throws RulesError listing every problem.
 * Returns records sorted by domain, then by their owning category's order,
 * then by id.
 */
export function loadRules() {
  const categories = loadCategories();
  const categoryIds = categories.map((c) => c.id);
  const elementNames = loadElementNames();
  const problems = [];
  const records = [];
  const ids = new Map();

  for (const { domain, file } of listRuleFiles()) {
    const where = repoRel(file);
    if (!DOMAINS.includes(domain)) {
      problems.push(`${where}: directory '${domain}' is not a domain (${DOMAINS.join(', ')})`);
      continue;
    }
    const raw = readFileSync(file, 'utf8');
    const parts = splitFrontmatter(raw);
    if (!parts) {
      problems.push(`${where}: missing or unterminated YAML frontmatter`);
      continue;
    }
    let fm;
    try {
      fm = YAML.parse(parts.frontmatter, { uniqueKeys: true, strict: true });
    } catch (error) {
      problems.push(`${where}: invalid YAML frontmatter — ${error.message.split('\n')[0]}`);
      continue;
    }
    if (!validateRecord(fm, file, domain, categoryIds, elementNames, problems)) continue;
    const offset = raw.slice(0, raw.length - parts.body.length).split('\n').length - 1;
    const { sections, examples } = parseBody(parts.body, where, problems, offset);
    if (!sections.get('Rationale')) problems.push(`${where}: '## Rationale' is required`);
    if (fm.status === 'active') {
      if (!sections.has('Examples')) problems.push(`${where}: active records need '## Examples'`);
      if (examples.good.length === 0) problems.push(`${where}: active records need at least one fence under ### Good`);
      if (examples.bad.length === 0) problems.push(`${where}: active records need at least one fence under ### Bad`);
    }
    for (const alias of fm.aliases ?? []) {
      if (ids.has(alias)) problems.push(`${where}: alias '${alias}' collides with ${ids.get(alias)}`);
      ids.set(alias, where);
    }
    if (ids.has(fm.id)) problems.push(`${where}: id '${fm.id}' is already used by ${ids.get(fm.id)}`);
    ids.set(fm.id, where);
    records.push({ ...fm, file: where, sections, examples });
  }

  // Owned categories: their `order` lists exactly the records in them.
  const byId = new Map(records.map((r) => [r.id, r]));
  for (const category of categories.filter((c) => c.owned)) {
    const members = records.filter((r) => r.categories?.includes(category.id)).map((r) => r.id);
    for (const id of category.order) {
      if (!byId.has(id)) problems.push(`rules/categories.yaml (${category.id}): order lists unknown rule '${id}'`);
      else if (!members.includes(id)) problems.push(`rules/categories.yaml (${category.id}): '${id}' is not in category ${category.id}`);
    }
    for (const id of members) {
      if (!category.order.includes(id)) {
        problems.push(`rules/categories.yaml (${category.id}): add '${id}' to the order list`);
      }
    }
    if (new Set(category.order).size !== category.order.length) {
      problems.push(`rules/categories.yaml (${category.id}): order lists a rule twice`);
    }
  }

  if (problems.length > 0) throw new RulesError(problems);
  return { records: sortRecords(records, categories), categories };
}

export function sortRecords(records, categories) {
  // Rank by the first owned category that lists the record (in
  // categories.yaml order), then by its position in that category's order.
  const rank = new Map();
  for (const [categoryIndex, category] of categories.entries()) {
    if (!category.owned) continue;
    for (const [index, id] of category.order.entries()) {
      if (!rank.has(id)) rank.set(id, [categoryIndex, index]);
    }
  }
  const none = [Infinity, Infinity];
  return [...records].sort((a, b) => {
    const domain = DOMAINS.indexOf(a.domain) - DOMAINS.indexOf(b.domain);
    if (domain !== 0) return domain;
    const [ca, ia] = rank.get(a.id) ?? none;
    const [cb, ib] = rank.get(b.id) ?? none;
    if (ca !== cb) return ca - cb;
    if (ia !== ib) return ia - ib;
    return a.id.localeCompare(b.id);
  });
}

/** Records that guidance may be generated from. */
export function liveRecords(records) {
  return records.filter((r) => r.status === 'active' || r.status === 'deprecated');
}

/**
 * Select records with a region selector string, e.g.
 * "domain=data-sources applies_to=ssl_data_source,sql_data_source".
 * Selectors AND together; comma-separated values within one selector OR.
 */
export function parseSelector(text) {
  const selector = {};
  let format = 'bullets';
  let wrap = 0;
  for (const token of text.trim().split(/\s+/).filter(Boolean)) {
    const match = token.match(/^([a-z_]+)=(.+)$/);
    if (!match) throw new Error(`bad selector token '${token}'`);
    const [, key, value] = match;
    if (key === 'format') {
      format = value;
      continue;
    }
    if (key === 'wrap') {
      wrap = Number(value);
      if (!Number.isInteger(wrap) || wrap < 40) throw new Error(`wrap must be a column number of at least 40`);
      continue;
    }
    if (!['id', 'category', 'domain', 'level', 'applies_to'].includes(key)) {
      throw new Error(`unknown selector '${key}' (id, category, domain, level, applies_to, format, wrap)`);
    }
    selector[key] = value.split(',');
  }
  if (!['bullets', 'table'].includes(format)) {
    throw new Error(`unknown format '${format}' (bullets, table)`);
  }
  if (Object.keys(selector).length === 0) throw new Error('a region needs at least one selector');
  return { selector, format, wrap };
}

export function selectRecords(records, selector) {
  return liveRecords(records).filter((r) =>
    Object.entries(selector).every(([key, values]) => {
      switch (key) {
        case 'id': return values.includes(r.id);
        case 'category': return r.categories.some((c) => values.includes(c));
        case 'domain': return values.includes(r.domain);
        case 'level': return values.includes(r.level);
        case 'applies_to': return r.applies_to.some((a) => values.includes(a));
        default: return false;
      }
    })
  );
}

/** Rule text without Markdown code spans, for the plain-text JSON packs. */
export function plainRule(record) {
  return record.rule.replace(/`([^`]*)`/g, '$1');
}

/** must_follow / avoid lists for a category, in that category's order. */
export function packLists(records, categoryId) {
  const members = liveRecords(records).filter((r) => r.machine && r.categories.includes(categoryId));
  return {
    must_follow: members.filter((r) => r.machine.list === 'must_follow').map(plainRule),
    avoid: members.filter((r) => r.machine.list === 'avoid').map(plainRule),
  };
}

/** Records flagged for a foundation list, in record order. */
export function foundationRecords(records, list) {
  return liveRecords(records).filter((r) => r.machine?.foundation === list);
}

/**
 * Word-wrap Markdown text into a bullet, never breaking inside a code span.
 */
export function wrapBullet(text, width = 74, first = '- ', rest = '  ') {
  const words = [];
  let current = '';
  let inCode = false;
  for (const ch of text) {
    if (ch === '`') inCode = !inCode;
    if (ch === ' ' && !inCode) {
      if (current) words.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current) words.push(current);
  const lines = [];
  let line = first;
  for (const word of words) {
    const prefix = lines.length === 0 ? first : rest;
    if (line.length > prefix.length && line.length + 1 + word.length > width) {
      lines.push(line);
      line = rest + word;
    } else {
      line += (line.length > prefix.length ? ' ' : '') + word;
    }
  }
  lines.push(line);
  return lines.join('\n');
}

/** Render a Markdown region body for selected records. */
export function renderRegion(records, format, indent, wrap = 0) {
  if (format === 'table') {
    const rows = [
      '| Rule | Level | Severity |',
      '|---|---|---|',
      ...records.map((r) => `| ${r.rule.replace(/\|/g, '\\|')} | ${r.level} | ${r.severity} |`),
    ];
    return rows.map((row) => indent + row).join('\n');
  }
  if (wrap > 0) return records.map((r) => wrapBullet(r.rule, wrap, `${indent}- `, `${indent}  `)).join('\n');
  return records.map((r) => `${indent}- ${r.rule}`).join('\n');
}
