#!/usr/bin/env bun

/**
 * Generate compact machine-focused SSL knowledge packs for agents.
 *
 * These files are intentionally small and retrieval-oriented. They sit between
 * the full prose guides and the element inventory: enough context to orient an
 * agent, with source paths and element names for deeper lookup through MCP.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import { foundationRecords, loadRules, packLists, plainRule, wrapBullet } from './lib/rules.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(REPO_ROOT, 'agent-guides/machine');
const CATEGORY_DIR = resolve(OUT_DIR, 'categories');
const CHECK_ONLY = process.argv.includes('--check');

const SOURCE_PATHS = {
  schema: 'ssl-style-guide/ssl-style-guide.schema.yaml',
  agentInstructions: 'agent-guides/ssl_agent_instructions.md',
  refactoringGuide: 'agent-guides/ssl_refactoring_guide.md',
  elementReference: 'ssl-style-guide/ssl-element-reference.json',
  elementMeta: 'ssl-style-guide/ssl-element-meta.json',
};

const SSL_DOC_GUIDES = {
  database: '../ssl-docs/content/guides/sql-queries.md',
  transactions: '../ssl-docs/content/guides/sql-transactions.md',
  dataSources: '../ssl-docs/content/guides/data-sources.md',
  errorHandling: '../ssl-docs/content/guides/error-handling.md',
  naming: '../ssl-docs/content/guides/naming-conventions.md',
  types: '../ssl-docs/content/guides/type-system.md',
};

const CATEGORY_DEFS = [
  {
    id: 'control-flow',
    label: 'Control Flow',
    aliases: ['control statements', 'conditionals', 'branching', 'case statements'],
    summary: 'Branching and early-return constructs for SSL scripts and procedures.',
    elements: ['IF', 'ELSE', 'ENDIF', 'BEGINCASE', 'CASE', 'OTHERWISE', 'EXITCASE', 'ENDCASE', 'RETURN'],
    // must_follow / avoid come from the rule records (rules/categories.yaml).
    related: ['loops', 'error-handling', 'operators'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions],
  },
  {
    id: 'loops',
    label: 'Loops',
    aliases: ['iteration', 'for loops', 'while loops', 'loop control'],
    summary: 'Iteration constructs, loop exits, and loop-control gotchas.',
    elements: ['FOR', 'TO', 'STEP', 'NEXT', 'WHILE', 'ENDWHILE', 'EXITFOR', 'EXITWHILE', 'LOOP', 'ALen'],
    // must_follow / avoid come from the rule records (rules/categories.yaml).
    related: ['arrays', 'control-flow', 'error-handling'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions],
  },
  {
    id: 'database',
    label: 'Database',
    aliases: ['db', 'queries', 'sql functions', 'lims database'],
    summary: 'SSL database APIs, query return shapes, and parameterization rules.',
    elements: [
      'SQLExecute',
      'RunSQL',
      'LSearch',
      'LSelect',
      'LSelect1',
      'LSelectC',
      'GetDataSet',
      'GetConnectionStrings',
      'GetDefaultConnection',
      'SetDefaultConnection',
      'LimsRecordsAffected',
    ],
    related: ['sql', 'transactions', 'data-sources', 'arrays'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions, SSL_DOC_GUIDES.database],
  },
  {
    id: 'sql',
    label: 'SQL Style',
    aliases: ['sql formatting', 'query style', 'sql strings'],
    summary: 'SQL formatting and query-construction conventions inside SSL strings.',
    elements: ['SQLExecute', 'RunSQL', 'LSearch', 'LSelect1', 'GetDataSet', 'BuildStringForIn', 'PrepareArrayForIn'],
    related: ['database', 'transactions', 'strings', 'arrays'],
    sourcePaths: [
      SOURCE_PATHS.schema,
      SOURCE_PATHS.agentInstructions,
      'ssl-style-guide/sql-canonical-compact-reference.md',
      SSL_DOC_GUIDES.database,
    ],
  },
  {
    id: 'transactions',
    label: 'Transactions',
    aliases: ['database transactions', 'commit', 'rollback'],
    summary: 'Transaction lifecycle functions and failure handling around database writes.',
    elements: [
      'BeginLimsTransaction',
      'EndLimsTransaction',
      'GetTransactionsCount',
      'IsInTransaction',
      'SQLExecute',
      'RunSQL',
      'GetLastSSLError',
    ],
    // must_follow / avoid come from the rule records (rules/categories.yaml).
    related: ['database', 'sql', 'error-handling'],
    sourcePaths: [SOURCE_PATHS.agentInstructions, SSL_DOC_GUIDES.transactions],
  },
  {
    id: 'strings',
    label: 'Strings',
    aliases: ['text', 'string functions', 'string comparisons'],
    summary: 'String literals, comparison semantics, containment, and common string helpers.',
    elements: [
      'Len',
      'AllTrim',
      'LimsString',
      'Upper',
      'Lower',
      'SubStr',
      'At',
      'BuildString',
      'BuildArray',
      'equals',
      'strict-equals',
      'dollar',
    ],
    // must_follow / avoid come from the rule records (rules/categories.yaml).
    related: ['operators', 'sql', 'formatting'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions],
  },
  {
    id: 'arrays',
    label: 'Arrays',
    aliases: ['array functions', '1-based arrays', 'lists'],
    summary: 'SSL array creation, indexing, traversal, and array helper functions.',
    elements: [
      'ArrayNew',
      'ALen',
      'AAdd',
      'AScan',
      'AScanExact',
      'AEval',
      'AEvalA',
      'AFill',
      'DelArray',
      'BuildArray',
      'BuildArray2',
      'BuildString',
      'BuildString2',
      'CompArray',
      'SortArray',
    ],
    // must_follow / avoid come from the rule records (rules/categories.yaml).
    related: ['loops', 'sql', 'types'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions, SSL_DOC_GUIDES.types],
  },
  {
    id: 'dates',
    label: 'Dates',
    aliases: ['date functions', 'date formatting', 'date conversion'],
    summary: 'Date conversion, formatting, and date arithmetic helpers.',
    elements: [
      'LIMSDate',
      'CToD',
      'DToC',
      'DToS',
      'DateAdd',
      'DateDiff',
      'DateFormat',
      'DateFromString',
      'DateToString',
      'Day',
      'Month',
      'Year',
      'DOW',
      'DOY',
    ],
    // must_follow / avoid come from the rule records (rules/categories.yaml).
    related: ['database', 'types', 'formatting'],
    sourcePaths: [SOURCE_PATHS.agentInstructions, SSL_DOC_GUIDES.types],
  },
  {
    id: 'classes',
    label: 'Classes',
    aliases: ['class files', 'methods', 'fields', 'inheritance'],
    summary: 'User-defined class structure, field access, method calls, and built-in class creation.',
    elements: ['CLASS', 'INHERIT', 'DECLARE', 'PUBLIC', 'CreateUdObject', 'me', 'base'],
    // must_follow / avoid come from the rule records (rules/categories.yaml).
    related: ['objects', 'procedures', 'naming'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions],
  },
  {
    id: 'objects',
    label: 'Objects',
    aliases: ['dynamic objects', 'properties', 'built-in classes', 'member access'],
    summary: 'Dynamic objects, properties, built-in classes, and member-access conventions.',
    elements: ['CreateUdObject', 'AddProperty', 'SSLExpando', 'Email', 'SQLConnection', 'me', 'base'],
    // must_follow / avoid come from the rule records (rules/categories.yaml).
    related: ['classes', 'types', 'formatting'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions],
  },
  {
    id: 'procedures',
    label: 'Procedures',
    aliases: ['script procedures', 'procedure calls', 'entry points'],
    summary: 'Procedure declarations, parameter/default ordering, and procedure-call mechanisms.',
    elements: ['PROCEDURE', 'ENDPROC', 'PARAMETERS', 'DEFAULT', 'DoProc', 'ExecFunction', 'RETURN'],
    // must_follow / avoid come from the rule records (rules/categories.yaml).
    related: ['classes', 'module-structure', 'naming'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions],
  },
  {
    id: 'data-sources',
    label: 'Data Sources',
    aliases: ['data source files', 'sql data sources', 'builder directives'],
    summary: 'SSL and SQL data-source syntax, inline defaults, and builder directives.',
    elements: ['PARAMETERS', 'RunDS', 'GetDSParameters', 'DSN', 'TABLENAME', 'NULLASBLANK', 'INVARIANTDATECOLUMNS'],
    // must_follow / avoid come from rules/data-sources/ (rules/categories.yaml).
    related: ['database', 'sql', 'procedures'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions, SSL_DOC_GUIDES.dataSources],
    allowMissingElements: ['DSN', 'TABLENAME', 'NULLASBLANK', 'INVARIANTDATECOLUMNS'],
  },
  {
    id: 'error-handling',
    label: 'Error Handling',
    aliases: ['try catch', 'exceptions', 'finally', 'ssl errors'],
    summary: 'Modern SSL error handling with TRY/CATCH/FINALLY and error retrieval.',
    elements: ['TRY', 'CATCH', 'FINALLY', 'ENDTRY', 'GetLastSSLError', 'ClearLastSSLError', 'ErrorMes'],
    // must_follow / avoid come from the rule records (rules/categories.yaml).
    related: ['control-flow', 'transactions', 'logging'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions, SSL_DOC_GUIDES.errorHandling],
  },
  {
    id: 'files',
    label: 'Files',
    aliases: ['file functions', 'directories', 'zip', 'ftp'],
    summary: 'File, directory, archive, and transfer helper functions.',
    elements: [
      'Directory',
      'CombineFiles',
      'CreateZip',
      'ExtractZip',
      'CopyToFtp',
      'DeleteFromFtp',
      'CheckOnFtp',
      'FtpsClient',
    ],
    mustFollow: [
      'Look up exact signatures before using file or transfer helpers.',
      'Treat path, FTP, and archive operations as side-effectful and handle errors explicitly.',
    ],
    avoid: [
      'Do not assume missing files or remote paths fail silently.',
      'Do not invent overloads for transfer helpers.',
    ],
    related: ['error-handling', 'strings'],
    sourcePaths: [SOURCE_PATHS.elementReference, SOURCE_PATHS.elementMeta],
  },
  {
    id: 'email',
    label: 'Email',
    aliases: ['mail', 'smtp', 'send email'],
    summary: 'Email built-in class and related message-sending behavior.',
    elements: ['Email', 'SendLimsEmail'],
    mustFollow: [
      'Instantiate the built-in Email class with curly braces.',
      'Look up exact recipient, attachment, CC, BCC, and ignore-error parameter behavior before sending.',
      'Handle send failures explicitly when workflow state depends on email delivery.',
    ],
    avoid: [
      'Do not pass NIL or empty recipient arrays unless the documented function behavior accepts them.',
      'Do not use CreateUdObject for Email.',
    ],
    related: ['objects', 'arrays', 'error-handling'],
    sourcePaths: [SOURCE_PATHS.elementReference, SOURCE_PATHS.elementMeta],
  },
  {
    id: 'security',
    label: 'Security',
    aliases: ['safe coding', 'sql injection', 'credentials'],
    summary: 'Security-sensitive SSL practices, especially SQL binding and dynamic code.',
    elements: ['DetectSqlInjections', 'SQLExecute', 'RunSQL', 'LSearch', 'ExecFunction', 'Eval'],
    mustFollow: [
      'Prefer parameterized SQL over string concatenation.',
      'Treat dynamic code execution and indirect procedure calls as security-sensitive.',
      'Avoid logging secrets, connection strings, passwords, or tokens.',
    ],
    avoid: [
      'Do not use SQL injection detection as a substitute for binding parameters.',
      'Do not execute code or procedure names derived from untrusted input without validation.',
    ],
    related: ['database', 'sql', 'procedures', 'logging'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions],
  },
  {
    id: 'formatting',
    label: 'Formatting',
    aliases: ['style', 'layout', 'comments', 'regions'],
    summary: 'Statement layout, indentation, comments, operators, and region comments.',
    elements: ['DECLARE', 'PARAMETERS', 'DEFAULT', 'INCLUDE', 'PUBLIC'],
    // must_follow / avoid come from the rule records (rules/categories.yaml).
    related: ['naming', 'operators', 'procedures'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions],
  },
  {
    id: 'naming',
    label: 'Naming',
    aliases: ['hungarian notation', 'identifiers', 'variable names'],
    summary: 'Procedure, class, variable, constant, and parameter naming conventions.',
    elements: ['DECLARE', 'PARAMETERS', 'PUBLIC'],
    mustFollow: [
      'Procedures and classes use PascalCase.',
      'Variables use Hungarian-style camelCase.',
      'Constants use UPPER_SNAKE_CASE.',
      'Use documented prefixes: s, n, b, d, a, o, fn, and v.',
    ],
    avoid: [
      'Do not rename values in behavior-preserving refactors unless the refactor scope includes naming cleanup.',
      'Do not invent prefixes outside the documented set without a reason.',
    ],
    related: ['formatting', 'classes', 'procedures'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions, SSL_DOC_GUIDES.naming],
  },
  {
    id: 'types',
    label: 'Types',
    aliases: ['type system', 'runtime types', 'literals'],
    summary: 'SSL primitive/runtime types, literals, and type-sensitive comparisons.',
    elements: ['array', 'boolean', 'date', 'nil', 'number', 'object', 'string', 'true', 'false', 'LimsString'],
    // must_follow / avoid come from the rule records (rules/categories.yaml).
    related: ['arrays', 'strings', 'dates', 'objects'],
    sourcePaths: [SOURCE_PATHS.agentInstructions, SSL_DOC_GUIDES.types],
  },
  {
    id: 'operators',
    label: 'Operators',
    aliases: ['comparisons', 'assignment', 'logical operators'],
    summary: 'Assignment, arithmetic, comparison, logical, containment, and member-access operators.',
    elements: [
      'assignment',
      'equals',
      'strict-equals',
      'not-equals',
      'less-than',
      'greater-than',
      'and',
      'or',
      'not',
      'dollar',
      'plus',
      'minus',
    ],
    // must_follow / avoid come from the rule records (rules/categories.yaml).
    related: ['strings', 'formatting', 'control-flow'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions],
  },
  {
    id: 'logging',
    label: 'Logging',
    aliases: ['messages', 'UsrMes', 'ErrorMes', 'InfoMes'],
    summary: 'Server logging helpers and message-output caveats.',
    elements: ['UsrMes', 'ErrorMes', 'InfoMes'],
    // must_follow / avoid come from the rule records (rules/categories.yaml).
    related: ['error-handling', 'security'],
    sourcePaths: [SOURCE_PATHS.agentInstructions, SOURCE_PATHS.elementReference],
  },
  {
    id: 'module-structure',
    label: 'Module Structure',
    aliases: ['file structure', 'script layout', 'includes'],
    summary: 'File-level organization for scripts, classes, and data sources.',
    elements: ['INCLUDE', 'PUBLIC', 'PARAMETERS', 'DEFAULT', 'DECLARE', 'CLASS', 'PROCEDURE'],
    // must_follow / avoid come from the rule records (rules/categories.yaml).
    related: ['procedures', 'classes', 'data-sources'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions],
  },
];

function readRepoText(relativePath) {
  return readFileSync(resolve(REPO_ROOT, relativePath), 'utf8');
}

function fail(message) {
  throw new Error(message);
}

function loadReference() {
  const ref = JSON.parse(readRepoText(SOURCE_PATHS.elementReference));
  const elements = new Map();
  for (const [bucket, type] of [
    ['keywords', 'keyword'],
    ['operators', 'operator'],
    ['literals', 'literal'],
    ['types', 'type'],
    ['classes', 'class'],
    ['special_forms', 'special_form'],
    ['functions', 'function'],
  ]) {
    for (const [name, entry] of Object.entries(ref[bucket] ?? {})) {
      elements.set(name.toLowerCase(), { name, type, ...entry });
    }
  }
  return { ref, elements };
}

function loadSchemaFacts() {
  const parsed = YAML.parse(readRepoText(SOURCE_PATHS.schema));
  const guide = parsed.ssl_style_guide ?? {};
  const prefixes = guide.lints?.hungarian_notation?.prefixes ?? {};
  const builtInClasses = guide.object_oriented?.object_creation?.builtin_classes?.all_classes ?? [];
  const schemaVersion = guide.metadata?.version ?? 'unknown';
  const schemaUpdated = guide.metadata?.last_updated ?? 'unknown';
  return { prefixes, builtInClasses, schemaVersion, schemaUpdated };
}

function findElement(elements, name) {
  return elements.get(name.toLowerCase()) ?? null;
}

function elementSummary(elements, name, category) {
  const element = findElement(elements, name);
  if (!element) {
    if (category.allowMissingElements?.includes(name)) {
      return {
        name,
        type: 'directive',
        summary: 'Data-source builder directive; preprocessed before SSL compilation.',
      };
    }
    fail(`${category.id}: element '${name}' was not found in ${SOURCE_PATHS.elementReference}`);
  }
  return {
    name: element.name,
    type: element.type,
    syntax: element.signature ?? element.syntax ?? element.symbol,
    summary: element.summary,
  };
}

// Categories marked lists_from_rules in rules/categories.yaml take their
// must_follow / avoid lists from the rule records. For the others, any record
// that names the category must appear word for word in the hard-coded list,
// so the two copies cannot drift apart before that category is migrated.
function ruleLists(category, rules) {
  const owned = rules.categories.find((c) => c.id === category.id)?.owned ?? false;
  if (owned) {
    if (category.mustFollow || category.avoid) {
      fail(`${category.id}: rule lists come from rules/; remove mustFollow/avoid from CATEGORY_DEFS`);
    }
    return packLists(rules.records, category.id);
  }
  for (const record of rules.records) {
    if (!record.machine?.list || !record.categories.includes(category.id)) continue;
    const list = record.machine.list === 'avoid' ? category.avoid : category.mustFollow;
    if (!list.includes(plainRule(record))) {
      fail(
        `${category.id}: rule ${record.id} (${record.file}) is not in CATEGORY_DEFS ` +
          `${record.machine.list} word for word: ${JSON.stringify(plainRule(record))}`
      );
    }
  }
  return { must_follow: category.mustFollow, avoid: category.avoid };
}

function checkCategoryIds(rules) {
  const defined = CATEGORY_DEFS.map((category) => category.id).join(', ');
  const listed = rules.categories.map((category) => category.id).join(', ');
  if (defined !== listed) {
    fail(`CATEGORY_DEFS ids (${defined}) differ from rules/categories.yaml (${listed})`);
  }
}

function categoryPack(category, elements, rules) {
  const lists = ruleLists(category, rules);
  return {
    id: category.id,
    label: category.label,
    aliases: category.aliases,
    summary: category.summary,
    must_follow: lists.must_follow,
    avoid: lists.avoid,
    elements: category.elements.map((name) => elementSummary(elements, name, category)),
    related_categories: category.related,
    source_paths: category.sourcePaths,
  };
}

// Every Non-Negotiable and Does Not Have bullet comes from a record. Each call
// selects the records for its spot: { domain: [...] } in record order, or
// { id: [...] } in the order given. renderFoundation checks that every
// flagged record is placed exactly once.
function foundationBullets(rules, list, selector, placed) {
  let records = foundationRecords(rules.records, list);
  if (selector.id) {
    records = selector.id.map(
      (id) => records.find((record) => record.id === id) ?? fail(`foundation: ${id} is not a ${list} record`)
    );
  } else {
    records = records.filter((record) => selector.domain.includes(record.domain));
  }
  for (const record of records) {
    if (placed.has(record.id)) fail(`foundation: ${record.id} is placed twice`);
    placed.add(record.id);
  }
  return records.map((record) => wrapBullet(record.rule, 74)).join('\n');
}

function checkFoundationPlaced(rules, list, placed) {
  for (const record of foundationRecords(rules.records, list)) {
    if (!placed.has(record.id)) {
      fail(`foundation: ${record.id} (${record.file}) has machine.foundation ${list} but no place in renderFoundation`);
    }
  }
}

function renderFoundation(schemaFacts, rules) {
  const prefixes = Object.entries(schemaFacts.prefixes)
    .map(([prefix, type]) => `- \`${prefix}\`: ${type}`)
    .join('\n');
  const placed = new Set();
  const bullets = (selector) => foundationBullets(rules, 'non_negotiable', selector, placed);
  const missing = (selector) => foundationBullets(rules, 'does_not_have', selector, placed);

  const text = `# SSL Machine Foundation

Generated compact baseline for SSL agents (source:
ssl-style-guide.schema.yaml v${schemaFacts.schemaVersion}, last_updated
${schemaFacts.schemaUpdated}, via tools/generate-machine-docs.mjs). Use this
first, then retrieve a category pack or element record for task-specific
detail.

## Retrieval Protocol

- Start with this foundation for every SSL planning, development, review, or
  refactoring task.
- Use \`category-index.json\` or \`ssl_context_pack\` to find compact topic
  context by category, alias, or element name.
- Use \`ssl_lookup\`, \`ssl_signature\`, and \`ssl_search\` before relying on a
  built-in function, class, keyword, operator, or signature.
- Run \`ssl_diagnose\` on any SSL you write or modify before declaring it done.
- Use \`ssl_format\` for formatting passes instead of hand-formatting.
- Read \`agent-guides/ssl_agent_instructions.md\` only when the compact pack and
  element inventory do not contain enough detail.

## Non-Negotiable SSL Rules

${bullets({
  id: [
    'keyword_uppercase',
    'statement_semicolon',
    'no_semicolon_in_comment_text',
    'condition_keyword_semicolon',
    'declare_before_use',
    'no_default_on_declare_line',
    'parameters_first',
    'default_after_parameters',
  ],
})}
${bullets({ domain: ['data-sources'] })}
${bullets({
  id: [
    'arrays_one_based',
    'net_collections_zero_based',
    'equals_vs_strict_equals',
    'doproc_for_same_file_procedures',
    'execfunction_for_external_scripts',
    'builtin_classes_curly_braces',
    'createudobject_category_qualified',
    'field_access_via_me',
    'prefer_try_over_error_resume',
    'try_requires_handler',
    'no_control_exit_in_finally',
  ],
})}
${bullets({ domain: ['sql'] })}

## SSL Does Not Have

Constructs from other languages that do not exist in SSL. Writing any of
these is an error — never invent them:

${missing({
  id: [
    'no_positional_parameter_access',
    'declare_initializer',
    'no_c_style_comment_closer',
    'endfor_invalid',
    'assignment_operator',
    'array_literal_braces',
    'null_literal_is_nil',
    'keywords_colon_prefixed',
    'no_ternary_operator',
    'sqlexecute_no_values_array',
  ],
})}

## Naming Prefixes

${prefixes}

## Primary Categories

${CATEGORY_DEFS.map((category) => `- \`${category.id}\`: ${category.summary}`).join('\n')}
`;
  checkFoundationPlaced(rules, 'non_negotiable', placed);
  checkFoundationPlaced(rules, 'does_not_have', placed);
  return text;
}

function indexFile(categoryPacks) {
  const sourcePaths = [
    ...Object.values(SOURCE_PATHS),
    ...Object.values(SSL_DOC_GUIDES),
  ];
  return {
    version: '1',
    description: 'Searchable category index for compact SSL machine documentation.',
    source_paths: sourcePaths,
    categories: categoryPacks.map((pack) => ({
      id: pack.id,
      label: pack.label,
      aliases: pack.aliases,
      summary: pack.summary,
      element_names: pack.elements.map((element) => element.name),
      related_categories: pack.related_categories,
      pack: `categories/${pack.id}.json`,
      source_paths: pack.source_paths,
    })),
  };
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function planOutputs() {
  const { elements } = loadReference();
  const schemaFacts = loadSchemaFacts();
  const rules = loadRules();
  checkCategoryIds(rules);
  const packs = CATEGORY_DEFS.map((category) => categoryPack(category, elements, rules));
  const outputs = [
    {
      label: 'agent-guides/machine/foundation.md',
      path: resolve(OUT_DIR, 'foundation.md'),
      content: renderFoundation(schemaFacts, rules),
    },
    {
      label: 'agent-guides/machine/category-index.json',
      path: resolve(OUT_DIR, 'category-index.json'),
      content: stableJson(indexFile(packs)),
    },
  ];

  for (const pack of packs) {
    outputs.push({
      label: `agent-guides/machine/categories/${pack.id}.json`,
      path: resolve(CATEGORY_DIR, `${pack.id}.json`),
      content: stableJson(pack),
    });
  }
  return outputs;
}

function currentGeneratedLabels() {
  if (!existsSync(OUT_DIR)) return [];
  const labels = [];
  for (const name of ['foundation.md', 'category-index.json']) {
    const path = resolve(OUT_DIR, name);
    if (existsSync(path)) labels.push(`agent-guides/machine/${name}`);
  }
  if (existsSync(CATEGORY_DIR)) {
    for (const file of readdirSync(CATEGORY_DIR).filter((name) => name.endsWith('.json')).sort()) {
      labels.push(`agent-guides/machine/categories/${file}`);
    }
  }
  return labels;
}

function main() {
  const outputs = planOutputs();
  const desiredLabels = new Set(outputs.map((output) => output.label));
  const stale = currentGeneratedLabels().filter((label) => !desiredLabels.has(label));
  const drift = [];
  const written = [];

  for (const output of outputs) {
    const current = existsSync(output.path) ? readFileSync(output.path, 'utf8') : null;
    if (current === output.content) continue;
    if (CHECK_ONLY) {
      drift.push(output.label);
      continue;
    }
    mkdirSync(dirname(output.path), { recursive: true });
    writeFileSync(output.path, output.content, 'utf8');
    written.push(output.label);
  }

  if (stale.length > 0) {
    if (CHECK_ONLY) {
      drift.push(...stale.map((label) => `${label} (stale)`));
    } else {
      for (const label of stale) {
        rmSync(resolve(REPO_ROOT, label), { force: true });
        written.push(`${label} (removed stale)`);
      }
    }
  }

  if (CHECK_ONLY) {
    if (drift.length > 0) {
      console.error('Machine docs are out of sync:');
      for (const label of drift) console.error(`  - ${label}`);
      console.error('Run: bun tools/generate-machine-docs.mjs');
      process.exit(1);
    }
    console.log(`Machine docs in sync (${outputs.length} files checked).`);
    return;
  }

  if (written.length === 0) {
    console.log(`Machine docs already up to date (${outputs.length} files).`);
    return;
  }
  console.log(`Generated machine docs (${outputs.length} planned files):`);
  for (const label of written) console.log(`  - ${label}`);
}

main();
