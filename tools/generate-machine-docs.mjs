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
    mustFollow: [
      'Use uppercase colon-prefixed keywords in SSL code, for example :IF and :BEGINCASE.',
      ':BEGINCASE requires at least one :CASE block.',
      'Terminate each :CASE and :OTHERWISE block with :EXITCASE unless deliberate fallthrough is required.',
      'Keep one statement per line and terminate every statement with a semicolon.',
    ],
    avoid: [
      'Do not rely on BEGINCASE fallthrough accidentally.',
      'Do not put semicolons inside comment text; the first semicolon ends the comment.',
    ],
    related: ['loops', 'error-handling', 'operators'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions],
  },
  {
    id: 'loops',
    label: 'Loops',
    aliases: ['iteration', 'for loops', 'while loops', 'loop control'],
    summary: 'Iteration constructs, loop exits, and loop-control gotchas.',
    elements: ['FOR', 'TO', 'STEP', 'NEXT', 'WHILE', 'ENDWHILE', 'EXITFOR', 'EXITWHILE', 'LOOP', 'ALen'],
    mustFollow: [
      'SSL arrays are 1-based; loop over arrays from 1 through ALen(aArray).',
      'Use :NEXT to end :FOR loops; :ENDFOR is not a valid loop terminator.',
      'Put a space before :STEP in :FOR headers.',
      'Do not use :RETURN, :EXITFOR, :EXITWHILE, or :LOOP inside :FINALLY.',
    ],
    avoid: [
      'Do not use zero-based indexes for SSL arrays.',
      'Do not assume .NET collection indexing rules apply to SSL arrays.',
    ],
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
    mustFollow: [
      'Prefer parameterized database calls.',
      'SQLExecute is the only database API that supports named ?param? substitution.',
      'RunSQL, LSearch, LSelect, LSelect1, LSelectC, and GetDataSet use positional ? placeholders with value arrays.',
      'Inside SQL strings, use uppercase SQL keywords and functions; keep normal SQL identifiers lowercase unless an external schema requires preserved casing.',
    ],
    avoid: [
      'Do not use ?param? named substitution with non-SQLExecute database functions.',
      'Do not concatenate user or runtime values into SQL when placeholders can bind them.',
      'Do not pass empty trailing optional parameters when they can be omitted.',
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
    mustFollow: [
      'Use multiline SQL strings for non-trivial queries and put major clauses on separate lines.',
      'Pre-compute complex values before interpolating them into SQLExecute placeholders.',
      'Use PrepareArrayForIn or SQLExecute array expansion for dynamic IN clauses when appropriate.',
      'Keep SQL keyword casing distinct from SSL identifier casing.',
    ],
    avoid: [
      'Do not build an IN clause by hand when a safer array helper or parameter array is available.',
      'Do not mix named and positional placeholder mental models in the same call.',
    ],
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
    mustFollow: [
      'Use :TRY/:CATCH around multi-step transactional database work.',
      'Call GetLastSSLError() inside :CATCH when error details are needed.',
      'Make rollback behavior explicit for write operations that can partially fail.',
    ],
    avoid: [
      'Do not leave transaction boundaries implicit in specs or refactors.',
      'Do not put control-flow exits inside :FINALLY.',
    ],
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
    mustFollow: [
      'Use == for exact string equality.',
      'Remember that = is prefix-style for strings and is not the same as exact equality.',
      'Use $ for containment tests.',
      'Use bracket strings when SQL or text contains many quotes.',
    ],
    avoid: [
      'Do not assume = and != are logical opposites for strings.',
      'Do not use string concatenation for SQL values when parameterization is available.',
    ],
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
    mustFollow: [
      'SSL arrays are 1-based.',
      'Declare array variables before use and initialize arrays before appending.',
      'Use adjacent commas with no spaces for skipped optional parameters.',
      'Check ALen before reading an index from dynamic input.',
    ],
    avoid: [
      'Do not pass NIL as the target array to mutating array helpers.',
      'Do not treat SSL arrays as zero-based .NET arrays.',
    ],
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
    mustFollow: [
      'Use documented date conversion functions rather than assuming implicit coercion.',
      'Keep canonical casing for LIMSDate, DOW, and DOY.',
      'Be explicit about invariant/local date handling when database result materialization depends on it.',
    ],
    avoid: [
      'Do not pass arbitrary strings or numbers to date-only functions unless the element documentation says they are accepted.',
    ],
    related: ['database', 'types', 'formatting'],
    sourcePaths: [SOURCE_PATHS.agentInstructions, SSL_DOC_GUIDES.types],
  },
  {
    id: 'classes',
    label: 'Classes',
    aliases: ['class files', 'methods', 'fields', 'inheritance'],
    summary: 'User-defined class structure, field access, method calls, and built-in class creation.',
    elements: ['CLASS', 'INHERIT', 'DECLARE', 'PUBLIC', 'CreateUdObject', 'me', 'base'],
    mustFollow: [
      'Keep class member order as :INHERIT, :DECLARE, regular methods, then Constructor.',
      'Access class fields through Me:fieldName or Base:fieldName inside methods.',
      'Call sibling or inherited methods with Me:Method() and Base:Method().',
      'Use CreateUdObject("ClassName") for user-defined classes.',
    ],
    avoid: [
      'Do not assign to class fields with bare identifiers inside methods.',
      'Do not call DoProc inside class methods.',
      'Do not instantiate built-in classes with CreateUdObject.',
    ],
    related: ['objects', 'procedures', 'naming'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions],
  },
  {
    id: 'objects',
    label: 'Objects',
    aliases: ['dynamic objects', 'properties', 'built-in classes', 'member access'],
    summary: 'Dynamic objects, properties, built-in classes, and member-access conventions.',
    elements: ['CreateUdObject', 'AddProperty', 'SSLExpando', 'Email', 'SQLConnection', 'me', 'base'],
    mustFollow: [
      'Reserve property for dynamic-object members, SSLExpando members, and AddProperty-created members.',
      'Use field for :DECLARE slots on classes.',
      'Instantiate directly creatable built-in classes with curly braces, for example Email{}.',
      'Use no spaces around member access colon.',
    ],
    avoid: [
      'Do not use CreateUdObject for built-in class instances.',
      'Do not blur class fields and dynamic object properties in documentation or reviews.',
    ],
    related: ['classes', 'types', 'formatting'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions],
  },
  {
    id: 'procedures',
    label: 'Procedures',
    aliases: ['script procedures', 'procedure calls', 'entry points'],
    summary: 'Procedure declarations, parameter/default ordering, and procedure-call mechanisms.',
    elements: ['PROCEDURE', 'ENDPROC', 'PARAMETERS', 'DEFAULT', 'DoProc', 'ExecFunction', 'RETURN'],
    mustFollow: [
      ':PARAMETERS must appear before any other statements in a script or procedure body.',
      ':DEFAULT must immediately follow :PARAMETERS.',
      'Use DoProc("ProcName", {args}) for same-file script procedures.',
      'Use ExecFunction("Category.Script", {args}) or ExecFunction("Category.Script.Proc", {args}) for external script entry points.',
    ],
    avoid: [
      'Do not call custom script procedures directly as MyProc().',
      'Do not put :DEFAULT on a :DECLARE line.',
      'Do not use DoProc inside class methods.',
    ],
    related: ['classes', 'module-structure', 'naming'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions],
  },
  {
    id: 'data-sources',
    label: 'Data Sources',
    aliases: ['data source files', 'sql data sources', 'builder directives'],
    summary: 'SSL and SQL data-source syntax, inline defaults, and builder directives.',
    elements: ['PARAMETERS', 'RunDS', 'GetDSParameters', 'DSN', 'TABLENAME', 'NULLASBLANK', 'INVARIANTDATECOLUMNS'],
    mustFollow: [
      'Invoke data sources with RunDS("Category.DataSourceName", {params}); GetDSParameters returns a data source parameter definition list.',
      'Data source files use inline :PARAMETERS defaults with := instead of separate :DEFAULT statements.',
      'Every data-source parameter must have a default.',
      'SQL data-source builder directives are preprocessed before compilation and are not normal SSL keywords.',
      'One file should represent either a class definition, a script, or a data source.',
    ],
    avoid: [
      'Do not apply normal script :PARAMETERS/:DEFAULT layout to data-source files.',
      'Do not treat builder directives as reusable SSL keywords outside data-source contexts.',
    ],
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
    mustFollow: [
      'Prefer :TRY/:CATCH/:FINALLY over legacy :ERROR/:RESUME.',
      ':TRY requires at least one of :CATCH or :FINALLY.',
      'Use GetLastSSLError() inside :CATCH to retrieve error details.',
      'Do not place :RETURN, :EXITFOR, :EXITWHILE, or :LOOP inside :FINALLY.',
    ],
    avoid: [
      'Do not write bare :TRY ... :ENDTRY blocks.',
      'Do not assume UsrMes, ErrorMes, or InfoMes displays messages to users; they are server log functions.',
    ],
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
    mustFollow: [
      'Use one statement per line.',
      'Almost every SSL statement, including comments, must end with a semicolon.',
      'Never include a semicolon inside comment text.',
      'Use spaces around assignment, arithmetic, comparison, and logical operators.',
      'Prefer /* region ...; and /* endregion; comments for editor grouping.',
    ],
    avoid: [
      'Do not use :REGION/:ENDREGION for code organization.',
      'Do not normalize indentation globally; preserve 4-space files and prefer tabs otherwise.',
    ],
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
    mustFollow: [
      'Use NIL for the nil literal and .T./.F. for booleans.',
      'Look up function parameter types before relying on coercion.',
      'Remember that member access can dispatch to underlying runtime members when no SSL-side member matches.',
    ],
    avoid: [
      'Do not assume every built-in coerces strings, numbers, dates, and NIL interchangeably.',
      'Do not confuse SSL arrays with .NET zero-based collections.',
    ],
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
    mustFollow: [
      'Use := for assignment.',
      'Use == when exact string equality matters.',
      'Use spaces around assignment, arithmetic, comparison, and logical operators.',
      'Use no spaces around member access colon.',
    ],
    avoid: [
      'Do not treat = as exact string equality.',
      'Do not assume != negates string prefix equality.',
    ],
    related: ['strings', 'formatting', 'control-flow'],
    sourcePaths: [SOURCE_PATHS.schema, SOURCE_PATHS.agentInstructions],
  },
  {
    id: 'logging',
    label: 'Logging',
    aliases: ['messages', 'UsrMes', 'ErrorMes', 'InfoMes'],
    summary: 'Server logging helpers and message-output caveats.',
    elements: ['UsrMes', 'ErrorMes', 'InfoMes'],
    mustFollow: [
      'Use ErrorMes for messages that must be written even when normal user-message logging is disabled.',
      'Treat UsrMes, ErrorMes, and InfoMes as server log functions, not UI display functions.',
      'Avoid logging secrets or sensitive runtime values.',
    ],
    avoid: [
      'Do not claim UsrMes displays a message to the end user.',
      'Do not use logging as error handling when caller-visible behavior depends on the result.',
    ],
    related: ['error-handling', 'security'],
    sourcePaths: [SOURCE_PATHS.agentInstructions, SOURCE_PATHS.elementReference],
  },
  {
    id: 'module-structure',
    label: 'Module Structure',
    aliases: ['file structure', 'script layout', 'includes'],
    summary: 'File-level organization for scripts, classes, and data sources.',
    elements: ['INCLUDE', 'PUBLIC', 'PARAMETERS', 'DEFAULT', 'DECLARE', 'CLASS', 'PROCEDURE'],
    mustFollow: [
      'One file should represent either a class definition, a script, or a data source.',
      'Place :INCLUDE early because it is lexer-level textual inclusion.',
      'Recommended script order is :PARAMETERS, :DEFAULT, :INCLUDE, :PUBLIC, :DECLARE.',
    ],
    avoid: [
      'Do not mix class definitions, script procedures, and data-source bodies in one file.',
      'Do not move :PARAMETERS after other statements.',
    ],
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

function sourceExists(sourcePath) {
  return existsSync(resolve(REPO_ROOT, sourcePath));
}

function categoryPack(category, elements) {
  return {
    id: category.id,
    label: category.label,
    aliases: category.aliases,
    summary: category.summary,
    must_follow: category.mustFollow,
    avoid: category.avoid,
    elements: category.elements.map((name) => elementSummary(elements, name, category)),
    related_categories: category.related,
    source_paths: category.sourcePaths,
    missing_optional_sources: category.sourcePaths.filter((path) => !sourceExists(path)),
  };
}

function renderFoundation(schemaFacts) {
  const prefixes = Object.entries(schemaFacts.prefixes)
    .map(([prefix, type]) => `- \`${prefix}\`: ${type}`)
    .join('\n');

  return `# SSL Machine Foundation

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

- Colon-prefixed SSL keywords are uppercase and case-sensitive.
- Almost every SSL statement, including comments, must end with a semicolon.
- Never include a semicolon inside comment text; the first semicolon ends the
  comment and the remaining text becomes executable code.
- Declare variables before use with \`:DECLARE\`.
- Do not put \`:DEFAULT\` on a \`:DECLARE\` line.
- In scripts and procedures, \`:PARAMETERS\` appears before any other statement
  and \`:DEFAULT\` immediately follows \`:PARAMETERS\`.
- Data source files are different: \`:PARAMETERS\` uses inline \`:=\` defaults,
  and every parameter must have a default.
- SSL arrays are 1-based.
- Use \`==\` for exact string equality; \`=\` is prefix-style for strings.
- Use \`DoProc("ProcName", {args})\` for same-file script procedures.
- Use \`ExecFunction("Category.Script", {args})\` or
  \`ExecFunction("Category.Script.Proc", {args})\` for external script entry
  points.
- Built-in classes instantiate with curly braces, for example \`Email{}\`.
- User-defined classes instantiate with \`CreateUdObject("ClassName")\`.
- Inside class methods, access fields through \`Me:fieldName\` or
  \`Base:fieldName\`.
- Prefer \`:TRY\`/\`:CATCH\`/\`:FINALLY\`; bare \`:TRY ... :ENDTRY\` is invalid.
- Do not put \`:RETURN\`, \`:EXITFOR\`, \`:EXITWHILE\`, or \`:LOOP\` inside
  \`:FINALLY\`.
- \`SQLExecute\` is the only database API that supports named \`?param?\`
  substitution.

## Naming Prefixes

${prefixes}

## Primary Categories

${CATEGORY_DEFS.map((category) => `- \`${category.id}\`: ${category.summary}`).join('\n')}
`;
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
  const packs = CATEGORY_DEFS.map((category) => categoryPack(category, elements));
  const outputs = [
    {
      label: 'agent-guides/machine/foundation.md',
      path: resolve(OUT_DIR, 'foundation.md'),
      content: renderFoundation(schemaFacts),
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
