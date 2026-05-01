import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { parse as parseYaml } from "yaml";
import type {
  Element,
  ElementMeta,
  ElementType,
  ReferenceEntry,
  ReferenceFile,
} from "../types.js";

interface MetaFileEntry {
  id: string;
  element_type: string;
  title: string;
  doc_status?: string;
  source_path?: string;
  exceptions?: { trigger: string; message: string }[];
  caveats?: string[];
  best_practices?: { do?: string[]; dont?: string[] };
}

interface MetaFile {
  version: string;
  source: string;
  elements: MetaFileEntry[];
}

/**
 * Builds an index keyed on the lowercased element name so we can layer
 * metadata onto entries flattened from ssl-element-reference.json.
 *
 * The meta file uses doc IDs like `ssl.function.execfunction`; we strip
 * the namespace and lowercase to match the canonical name keys.
 */
function loadElementMeta(): Record<string, ElementMeta> {
  let raw: MetaFile;
  try {
    raw = JSON.parse(readFileSync(dataPath("ssl-element-meta.json"), "utf-8")) as MetaFile;
  } catch {
    // Optional file: if it's missing the MCP server still works, just
    // without exception text in element responses.
    return {};
  }
  const index: Record<string, ElementMeta> = {};
  for (const e of raw.elements) {
    const idLower = e.id.toLowerCase();
    const name = idLower.includes(".") ? idLower.split(".").pop() ?? "" : idLower;
    if (!name) continue;
    index[name] = {
      doc_id: e.id,
      doc_status: e.doc_status,
      doc_source: e.source_path,
      exceptions: e.exceptions?.length ? e.exceptions : undefined,
      caveats: e.caveats?.length ? e.caveats : undefined,
      best_practices: e.best_practices &&
        ((e.best_practices.do && e.best_practices.do.length) ||
          (e.best_practices.dont && e.best_practices.dont.length))
          ? e.best_practices
          : undefined,
    };
  }
  return index;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
// dist/data/loader.js → ../../data/ (i.e. ssl-mcp-server/data/)
const DATA_DIR = resolve(__dirname, "..", "..", "data");

function dataPath(filename: string): string {
  return resolve(DATA_DIR, filename);
}

/**
 * Symbol forms for operators (file stem → literal symbol) and literals.
 * Operators are keyed by ssl-docs filename stem; literals by stem too.
 */
const OPERATOR_SYMBOLS: Record<string, string> = {
  "add-assign": "+=",
  "subtract-assign": "-=",
  "multiply-assign": "*=",
  "divide-assign": "/=",
  "modulo-assign": "%=",
  "power-assign": "^=",
  assignment: ":=",
  plus: "+",
  minus: "-",
  multiply: "*",
  divide: "/",
  modulo: "%",
  power: "^",
  "double-star-power": "**",
  increment: "++",
  decrement: "--",
  equals: "=",
  "strict-equals": "==",
  "not-equals": "!=",
  "not-equals-legacy": "<>",
  hash: "#",
  "less-than": "<",
  "greater-than": ">",
  "less-than-or-equal": "<=",
  "greater-than-or-equal": ">=",
  and: ".AND.",
  or: ".OR.",
  not: ".NOT.",
  bang: "!",
  dollar: "$",
  "shift-left": "<<",
  "shift-right": ">>",
};

const LITERAL_SYMBOLS: Record<string, string> = {
  true: ".T.",
  false: ".F.",
  nil: "NIL",
};

const CATEGORIES: { key: keyof ReferenceFile; type: ElementType }[] = [
  { key: "keywords", type: "keyword" },
  { key: "operators", type: "operator" },
  { key: "literals", type: "literal" },
  { key: "types", type: "type" },
  { key: "classes", type: "class" },
  { key: "special_forms", type: "special_form" },
  { key: "functions", type: "function" },
];

function symbolFor(type: ElementType, name: string): string | null {
  if (type === "operator") return OPERATOR_SYMBOLS[name] ?? null;
  if (type === "literal") return LITERAL_SYMBOLS[name] ?? null;
  return null;
}

function flattenReference(ref: ReferenceFile, metaIndex: Record<string, ElementMeta>): Element[] {
  const elements: Element[] = [];
  for (const { key, type } of CATEGORIES) {
    const bucket = ref[key] as Record<string, ReferenceEntry> | undefined;
    if (!bucket) continue;
    for (const [name, entry] of Object.entries(bucket)) {
      const meta = metaIndex[name.toLowerCase()] ?? {};
      elements.push({
        ...entry,
        type,
        name,
        symbol: symbolFor(type, name),
        ...meta,
      });
    }
  }
  return elements;
}

export interface LoadedData {
  elements: Element[];
  referenceTotals: Record<string, number>;
  styleGuide: Record<string, unknown>;
  agentInstructions: string;
  refactoringGuide: string;
  ebnfGrammar: string;
}

function formatElementType(type: string): string {
  if (type === "class") return "classes";
  if (type === "special_form") return "special forms";
  return `${type}s`;
}

export function loadAllData(): LoadedData {
  const ref = JSON.parse(
    readFileSync(dataPath("ssl-element-reference.json"), "utf-8")
  ) as ReferenceFile;
  const metaIndex = loadElementMeta();
  const elements = flattenReference(ref, metaIndex);

  const styleGuide = parseYaml(
    readFileSync(dataPath("ssl-style-guide.schema.yaml"), "utf-8")
  ) as Record<string, unknown>;
  const agentInstructions = readFileSync(dataPath("ssl_agent_instructions.md"), "utf-8");
  const refactoringGuide = readFileSync(dataPath("ssl_refactoring_guide.md"), "utf-8");
  const ebnfGrammar = readFileSync(dataPath("ssl-ebnf-grammar.md"), "utf-8");

  const byType = elements.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});

  process.stderr.write(
    `[ssl-mcp-server] Loaded ${elements.length} elements: ` +
      Object.entries(byType)
        .map(([t, n]) => `${n} ${formatElementType(t)}`)
        .join(", ") +
      "\n"
  );

  return {
    elements,
    referenceTotals: ref.totals,
    styleGuide,
    agentInstructions,
    refactoringGuide,
    ebnfGrammar,
  };
}
