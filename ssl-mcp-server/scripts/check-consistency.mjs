#!/usr/bin/env bun

import { readdirSync, readFileSync, statSync } from 'fs';
import { execFileSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadAllData } from '../src/data/loader.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverRoot = resolve(__dirname, '..');
const repoRoot = resolve(serverRoot, '..');

const mirrorPairs = [
  ['ssl-style-guide/ssl-style-guide.schema.yaml', 'ssl-mcp-server/data/ssl-style-guide.schema.yaml'],
  ['agent-guides/ssl_agent_instructions.md', 'ssl-mcp-server/data/ssl_agent_instructions.md'],
  ['agent-guides/ssl_refactoring_guide.md', 'ssl-mcp-server/data/ssl_refactoring_guide.md'],
  ['ssl-style-guide/ssl-ebnf-grammar.md', 'ssl-mcp-server/data/ssl-ebnf-grammar.md'],
];

const mirrorDirs = [
  ['agent-guides/machine', 'ssl-mcp-server/data/machine'],
];

function readRepoFile(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), 'utf8');
}

function fail(message) {
  throw new Error(message);
}

function extractPipeList(text, pattern, label) {
  const match = text.match(pattern);
  if (!match) {
    fail(`Unable to extract ${label}.`);
  }
  return match[1].split('|');
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    fail(`${label}: expected ${expected}, got ${actual}`);
  }
}

function assertArrayEqual(left, right, label) {
  if (left.length !== right.length) {
    fail(`${label}: length mismatch ${left.length} vs ${right.length}`);
  }

  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) {
      fail(`${label}: mismatch at index ${i}: ${left[i]} vs ${right[i]}`);
    }
  }
}

function assertIncludes(text, snippet, label) {
  if (!text.includes(snippet)) {
    fail(`${label}: missing expected snippet ${JSON.stringify(snippet)}`);
  }
}

function listFiles(relativeDir) {
  const root = resolve(repoRoot, relativeDir);
  const files = [];
  function walk(dir) {
    for (const entry of readdirSync(dir).sort()) {
      const full = resolve(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (stat.isFile()) {
        files.push(full.slice(root.length + 1));
      }
    }
  }
  walk(root);
  return files;
}

for (const [sourcePath, mirrorPath] of mirrorPairs) {
  const source = readRepoFile(sourcePath);
  const mirror = readRepoFile(mirrorPath);
  if (source !== mirror) {
    fail(`Bundled mirror drift: ${sourcePath} != ${mirrorPath}`);
  }
}

for (const [sourceDir, mirrorDir] of mirrorDirs) {
  const sourceFiles = listFiles(sourceDir);
  const mirrorFiles = listFiles(mirrorDir);
  assertArrayEqual(sourceFiles, mirrorFiles, `Bundled mirror file list: ${sourceDir}`);
  for (const file of sourceFiles) {
    const source = readRepoFile(`${sourceDir}/${file}`);
    const mirror = readRepoFile(`${mirrorDir}/${file}`);
    if (source !== mirror) {
      fail(`Bundled mirror drift: ${sourceDir}/${file} != ${mirrorDir}/${file}`);
    }
  }
}

const highlights = readRepoFile('ssl-style-guide/tree-sitter-ssl/queries/highlights.scm');
const textMate = JSON.parse(readRepoFile('ssl-style-guide/ssl.tmLanguage.updated.json'));
const rootReadme = readRepoFile('README.md');
const mcpReadme = readRepoFile('ssl-mcp-server/README.md');
const agentInstructions = readRepoFile('agent-guides/ssl_agent_instructions.md');
const ebnfGrammar = readRepoFile('ssl-style-guide/ssl-ebnf-grammar.md');
const loadedData = loadAllData();
const styleGuide = loadedData.styleGuide.ssl_style_guide;

const highlightFunctions = extractPipeList(
  highlights,
  /\(\?i\)\^\(([^)]*)\)\$"\)\)\n\n; Built-in SSL class names/s,
  'Tree-sitter built-in functions'
).sort();
const highlightClasses = extractPipeList(
  highlights,
  /Built-in SSL class names.*?\(\?i\)\^\(([^)]*)\)\$"\)\)/s,
  'Tree-sitter built-in classes'
).sort();
const textMateFunctions = extractPipeList(
  textMate.repository.builtInFunctions.patterns[0].match,
  /\(\?i\)\\b\((.*)\)\\b/,
  'TextMate built-in functions'
).sort();
const textMateClasses = extractPipeList(
  textMate.repository.builtInClassInstantiation.patterns[0].match,
  /\(\?i\)\\b\((.*)\)\\b\(\?=\\s\*\\\{\)/,
  'TextMate built-in classes'
).sort();
const schemaBuiltinClasses = styleGuide.object_oriented.object_creation.builtin_classes.all_classes;
const elementFunctions = loadedData.elements
  .filter((element) => element.type === 'function')
  .map((element) => element.name)
  .sort();

// Counts match the published ssl-docs reference (../ssl-docs/content/reference/).
assertEqual(highlightFunctions.length, 330, 'Tree-sitter built-in function count');
assertEqual(textMateFunctions.length, 330, 'TextMate built-in function count');
assertEqual(highlightClasses.length, 29, 'Tree-sitter built-in class count');
assertEqual(textMateClasses.length, 29, 'TextMate built-in class count');
assertEqual(schemaBuiltinClasses.length, 29, 'Schema built-in class count');
assertEqual(elementFunctions.length, 330, 'Element inventory function count');

assertArrayEqual(highlightFunctions, textMateFunctions, 'Tree-sitter/TextMate function inventory');
assertArrayEqual(highlightFunctions, elementFunctions, 'Tree-sitter/element function inventory');
assertArrayEqual(highlightClasses, textMateClasses, 'Tree-sitter/TextMate class inventory');
assertArrayEqual(schemaBuiltinClasses, textMateClasses, 'Schema/TextMate built-in classes');

if (!highlights.includes('Built-in SSL function inventory (synchronized with TextMate highlighting)')) {
  fail('Tree-sitter highlights comment drifted from the synchronized inventory wording.');
}

assertIncludes(
  agentInstructions,
  'DoProc("MyProc", {param1,,param3,,param5});',
  'Agent instructions skipped-parameter example'
);
assertIncludes(
  ebnfGrammar,
  'indirectFunction("function", {param1,,param3})',
  'EBNF skipped-parameter example'
);
assertIncludes(
  rootReadme,
  'Built-in function\ninventories should stay aligned with Tree-sitter highlighting and the checked-in\nelement inventory.',
  'Root README function inventory wording'
);
assertIncludes(
  rootReadme,
  'bun run check:consistency',
  'Root README consistency command'
);
assertIncludes(
  mcpReadme,
  'bun run check:consistency',
  'MCP README consistency command'
);

// Generated agent adapters must stay in sync with their canonical sources in
// agent-guides/agents/ (see tools/generate-agents.mjs).
try {
  execFileSync('bun', [resolve(repoRoot, 'tools/generate-agents.mjs'), '--check'], {
    stdio: 'pipe',
  });
} catch (error) {
  const detail = [error.stdout, error.stderr]
    .map((stream) => (stream ? stream.toString().trim() : ''))
    .filter(Boolean)
    .join('\n');
  fail(`Agent adapters out of sync — run 'bun tools/generate-agents.mjs'.\n${detail}`);
}

try {
  execFileSync('bun', [resolve(repoRoot, 'tools/generate-machine-docs.mjs'), '--check'], {
    stdio: 'pipe',
  });
} catch (error) {
  const detail = [error.stdout, error.stderr]
    .map((stream) => (stream ? stream.toString().trim() : ''))
    .filter(Boolean)
    .join('\n');
  fail(`Machine docs out of sync — run 'bun tools/generate-machine-docs.mjs'.\n${detail}`);
}

// Bundled reference JSON must mirror ssl-mcp-server/data/ and match ssl-docs
// (the latter is skipped when ../ssl-docs is not present locally).
try {
  execFileSync('bun', [resolve(repoRoot, 'tools/check-reference-drift.mjs')], {
    stdio: 'pipe',
  });
} catch (error) {
  const detail = [error.stdout, error.stderr]
    .map((stream) => (stream ? stream.toString().trim() : ''))
    .filter(Boolean)
    .join('\n');
  fail(`Reference data drift detected.\n${detail}`);
}

// The version the server advertises over MCP must match package.json. These
// drifted silently for four releases (constant stuck at 1.7.0 while the
// package reached 1.11.1), so clients were told the wrong version.
{
  const pkgVersion = JSON.parse(readRepoFile('ssl-mcp-server/package.json')).version;
  const constantsSource = readRepoFile('ssl-mcp-server/src/constants.ts');
  const match = constantsSource.match(/MCP_SERVER_VERSION\s*=\s*"([^"]+)"/);
  if (!match) {
    fail('Could not find MCP_SERVER_VERSION in ssl-mcp-server/src/constants.ts');
  }
  if (match[1] !== pkgVersion) {
    fail(
      `MCP_SERVER_VERSION (${match[1]}) does not match ssl-mcp-server/package.json (${pkgVersion}) — ` +
        'clients would be told the wrong version.'
    );
  }
}

console.log('Consistency checks passed.');
