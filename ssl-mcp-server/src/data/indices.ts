import type { Element } from "../types.js";
import type { MachineDocs } from "../types.js";
import type { LoadedData } from "./loader.js";

export interface Indices {
  elementsByName: Map<string, Element>;
  elementsBySymbol: Map<string, Element>;
  elementsByType: Map<string, Element[]>;
  elementsByCategory: Map<string, string[]>;
  hungarianPrefixes: Map<string, string>;
  styleGuide: Record<string, unknown>;
  agentInstructions: string;
  refactoringGuide: string;
  ebnfGrammar: string;
  machineDocs: MachineDocs;
}

export function buildIndices(data: LoadedData): Indices {
  const { elements, styleGuide } = data;

  const elementsByName = new Map<string, Element>();
  const elementsBySymbol = new Map<string, Element>();
  const elementsByType = new Map<string, Element[]>();

  for (const el of elements) {
    elementsByName.set(el.name.toLowerCase(), el);
    if (el.symbol) {
      elementsBySymbol.set(el.symbol.toLowerCase(), el);
    }
    const arr = elementsByType.get(el.type) ?? [];
    arr.push(el);
    elementsByType.set(el.type, arr);
  }

  // Build category index from style guide YAML (procedures.function_categories)
  const elementsByCategory = new Map<string, string[]>();
  try {
    const ssg = styleGuide as Record<string, unknown>;
    const guide = ssg["ssl_style_guide"] as Record<string, unknown> | undefined;
    const procedures = guide?.["procedures"] as Record<string, unknown> | undefined;
    const categories = procedures?.["function_categories"] as
      | Record<string, string[]>
      | undefined;
    if (categories) {
      for (const [cat, fns] of Object.entries(categories)) {
        elementsByCategory.set(cat, fns);
      }
    }
  } catch {
    // ignore
  }

  // Hungarian prefixes from lints.hungarian_notation
  const hungarianPrefixes = new Map<string, string>();
  try {
    const ssg = styleGuide as Record<string, unknown>;
    const guide = ssg["ssl_style_guide"] as Record<string, unknown> | undefined;
    const lints = guide?.["lints"] as Record<string, unknown> | undefined;
    const hungarianNotation = lints?.["hungarian_notation"] as
      | Record<string, unknown>
      | undefined;
    const prefixes = hungarianNotation?.["prefixes"] as
      | Record<string, string>
      | undefined;
    if (prefixes) {
      for (const [prefix, type] of Object.entries(prefixes)) {
        hungarianPrefixes.set(prefix, type);
      }
    }
  } catch {
    // ignore
  }

  process.stderr.write(
    `[ssl-mcp-server] Indices built: ${elementsByName.size} by-name, ` +
      `${elementsBySymbol.size} by-symbol, ${elementsByCategory.size} categories, ` +
      `${hungarianPrefixes.size} Hungarian prefixes\n`
  );

  return {
    elementsByName,
    elementsBySymbol,
    elementsByType,
    elementsByCategory,
    hungarianPrefixes,
    styleGuide,
    agentInstructions: data.agentInstructions,
    refactoringGuide: data.refactoringGuide,
    ebnfGrammar: data.ebnfGrammar,
    machineDocs: data.machineDocs,
  };
}
