import type { Element, ClassValidation } from "../types.js";
import type { LoadedData } from "./loader.js";

export interface Indices {
  elementsByName: Map<string, Element>;
  elementsBySymbol: Map<string, Element>;
  elementsByType: Map<string, Element[]>;
  elementsByCategory: Map<string, string[]>;
  classMemberDetail: Map<string, ClassValidation>;
  hungarianPrefixes: Map<string, string>;
  styleGuide: Record<string, unknown>;
  agentInstructions: string;
  refactoringGuide: string;
  ebnfGrammar: string;
}

export function buildIndices(data: LoadedData): Indices {
  const { elements, classMemberValidation, styleGuide } = data;

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

  // Build category index from style guide YAML
  const elementsByCategory = new Map<string, string[]>();
  try {
    const ssg = styleGuide as Record<string, unknown>;
    const guide = ssg["ssl_style_guide"] as Record<string, unknown> | undefined;
    const procedures = guide?.["procedures"] as Record<string, unknown> | undefined;
    const categories = procedures?.["function_categories"] as Record<string, string[]> | undefined;
    if (categories) {
      for (const [cat, fns] of Object.entries(categories)) {
        elementsByCategory.set(cat, fns);
      }
    }
  } catch {
    // ignore
  }

  // Class member detail index
  const classMemberDetail = new Map<string, ClassValidation>();
  for (const cls of classMemberValidation.classes) {
    classMemberDetail.set(cls.name.toLowerCase(), cls);
  }

  // Hungarian prefixes from naming section
  const hungarianPrefixes = new Map<string, string>();
  try {
    const ssg = styleGuide as Record<string, unknown>;
    const guide = ssg["ssl_style_guide"] as Record<string, unknown> | undefined;
    const naming = guide?.["naming"] as Record<string, unknown> | undefined;
    const prefixes = naming?.["prefixes"] as Record<string, string> | undefined;
    if (prefixes) {
      for (const [type, prefix] of Object.entries(prefixes)) {
        hungarianPrefixes.set(prefix, type);
      }
    }
    // Also check lints section for extended prefix list
    const lints = guide?.["lints"] as Record<string, unknown> | undefined;
    const styleRules = lints?.["style_rules"] as Record<string, unknown>[] | undefined;
    if (styleRules) {
      for (const rule of styleRules) {
        const id = rule["id"] as string | undefined;
        if (id === "hungarian_notation") {
          const extras = rule["prefixes"] as Record<string, string> | undefined;
          if (extras) {
            for (const [pfx, typeName] of Object.entries(extras)) {
              if (!hungarianPrefixes.has(pfx)) {
                hungarianPrefixes.set(pfx, typeName);
              }
            }
          }
        }
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
    classMemberDetail,
    hungarianPrefixes,
    styleGuide,
    agentInstructions: data.agentInstructions,
    refactoringGuide: data.refactoringGuide,
    ebnfGrammar: data.ebnfGrammar,
  };
}
