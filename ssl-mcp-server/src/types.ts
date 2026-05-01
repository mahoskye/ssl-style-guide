// Types matching ssl-element-reference.json (the canonical SSL element source)
// generated from ssl-docs by tools/generate_element_reference.py.

export type ElementType =
  | "keyword"
  | "operator"
  | "literal"
  | "type"
  | "class"
  | "special_form"
  | "function";

/** A single row from a markdown table in ssl-docs (e.g. parameters, methods). */
export interface TableRow {
  [column: string]: string | undefined;
}

export interface ConstructorEntry {
  signature: string;
  description?: string;
  parameters?: TableRow[];
}

export interface ReturnsInfo {
  type: string;
  description?: string;
}

/** Raw entry from ssl-element-reference.json. Fields vary by element type. */
export interface ReferenceEntry {
  title: string;
  summary: string;
  syntax?: string;
  // operator-specific
  type_behavior?: TableRow[];
  // type-specific
  runtime_type?: string;
  operators?: TableRow[];
  members?: TableRow[];
  // class-specific
  constructors?: ConstructorEntry[];
  properties?: TableRow[];
  methods?: TableRow[];
  base_class?: string;
  // function-specific
  signature?: string;
  returns?: ReturnsInfo;
  parameters?: TableRow[];
}

export interface ReferenceFile {
  version: string;
  source: string;
  totals: Record<string, number>;
  keywords: Record<string, ReferenceEntry>;
  operators: Record<string, ReferenceEntry>;
  literals: Record<string, ReferenceEntry>;
  types: Record<string, ReferenceEntry>;
  classes: Record<string, ReferenceEntry>;
  special_forms: Record<string, ReferenceEntry>;
  functions: Record<string, ReferenceEntry>;
}

/**
 * Flattened element record used internally by the MCP server. Combines the
 * raw ReferenceEntry with the element type and canonical name (filename stem
 * from ssl-docs).
 */
export interface Element extends ReferenceEntry {
  type: ElementType;
  name: string;
  /** Symbol form for operators/literals (e.g. "+=", ".T.") if applicable. */
  symbol: string | null;
}

// Search result
export interface SearchResult {
  name: string;
  type: ElementType;
  syntax: string;
}

// Naming validation result
export interface NamingValidationResult {
  valid: boolean;
  prefix: string;
  inferred_type: string | null;
  body: string;
  issues: string[];
}
