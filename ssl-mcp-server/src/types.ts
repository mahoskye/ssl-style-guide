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
 * Documented exception row extracted from the `## Exceptions` section of an
 * ssl-docs page. `trigger` is the prose condition that produces the
 * exception; `message` is the exact runtime exception text.
 */
export interface DocumentedException {
  trigger: string;
  message: string;
}

/**
 * `## Best practices` Do/Don't lists from ssl-docs, normalized.
 */
export interface BestPractices {
  do?: string[];
  dont?: string[];
}

/**
 * Per-element prose metadata extracted from ssl-docs. Optional everywhere —
 * not every page documents every section. Populated by the
 * ssl-element-meta.json bundle; layered on top of `ReferenceEntry` when
 * the loader flattens elements.
 */
export interface ElementMeta {
  /** Frontmatter `id`, e.g. `"ssl.function.execfunction"`. */
  doc_id?: string;
  /** Frontmatter `doc_status`, e.g. `"published"`. */
  doc_status?: string;
  /** Repo-relative source path of the ssl-docs page. */
  doc_source?: string;
  /** Documented exceptions, parsed from the `## Exceptions` table. */
  exceptions?: DocumentedException[];
  /** Documented caveats / quirks. */
  caveats?: string[];
  /** Best-practice Do / Don't lists. */
  best_practices?: BestPractices;
}

/**
 * Flattened element record used internally by the MCP server. Combines the
 * raw ReferenceEntry with the element type and canonical name (filename stem
 * from ssl-docs).
 */
export interface Element extends ReferenceEntry, ElementMeta {
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

export interface MachineCategoryElement {
  name: string;
  type: string;
  syntax?: string;
  summary?: string;
}

export interface MachineCategoryPack {
  id: string;
  label: string;
  aliases: string[];
  summary: string;
  must_follow: string[];
  avoid: string[];
  elements: MachineCategoryElement[];
  related_categories: string[];
  source_paths: string[];
  missing_optional_sources?: string[];
}

export interface MachineCategoryIndexEntry {
  id: string;
  label: string;
  aliases: string[];
  summary: string;
  element_names: string[];
  related_categories: string[];
  pack: string;
  source_paths: string[];
}

export interface MachineCategoryIndex {
  version: string;
  description: string;
  source_paths: string[];
  categories: MachineCategoryIndexEntry[];
}

export interface MachineDocs {
  foundation: string;
  categoryIndex: MachineCategoryIndex;
  categories: Record<string, MachineCategoryPack>;
}
