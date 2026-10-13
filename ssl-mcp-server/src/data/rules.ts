import type { RuleRecord, RulesBundle } from "../types.js";

/**
 * Lookup structures over the rules bundle (data/rules.json).
 *
 * A rule is found by its id. The resolver also accepts the other names a
 * rule goes by, so callers holding a slug from elsewhere reach the record:
 *
 *   - an earlier id listed in the record's `aliases`;
 *   - a style-guide schema path the record supplies, such as
 *     `lints.compile_errors.rules.loop_in_finally.message`, or the lint slug
 *     inside it (`loop_in_finally`);
 *   - a starlims-lsp diagnostic or formatter code from `enforced_by`, with
 *     or without its `lsp:diag.` / `lsp:fmt.` prefix.
 */

export type RuleMatch =
  | "id"
  | "alias"
  | "schema_path"
  | "schema_slug"
  | "lsp_diagnostic"
  | "lsp_formatter";

export interface RuleResolution {
  matched_by: RuleMatch;
  rules: RuleRecord[];
}

export interface RuleIndex {
  bundle: RulesBundle;
  all: RuleRecord[];
  byId: Map<string, RuleRecord>;
  byAlias: Map<string, RuleRecord>;
  bySchemaSlug: Map<string, RuleRecord[]>;
  byDiagnostic: Map<string, RuleRecord[]>;
  byFormatter: Map<string, RuleRecord[]>;
}

export interface RuleFilters {
  domain?: string;
  category?: string;
  applies_to?: string;
  level?: string;
  severity?: string;
  /** `lsp` (any LSP diagnostic or formatter), `reviewer`, `none`, or an exact `enforced_by` entry. */
  enforced_by?: string;
  /** Case-insensitive words, all of which must appear in the id, title, rule or rationale. */
  query?: string;
  /** Include draft and removed records (default: active and deprecated only). */
  include_inactive?: boolean;
}

function push<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const list = map.get(key);
  if (list) {
    if (!list.includes(value)) list.push(value);
  } else {
    map.set(key, [value]);
  }
}

/** The lint slug a schema path names: the list entry whose `message` it is. */
export function schemaSlug(path: string): string | null {
  const segments = path.split(".");
  if (segments.length >= 2 && segments[segments.length - 1] === "message") {
    return segments[segments.length - 2];
  }
  return null;
}

export function buildRuleIndex(bundle: RulesBundle): RuleIndex {
  const byId = new Map<string, RuleRecord>();
  const byAlias = new Map<string, RuleRecord>();
  const bySchemaSlug = new Map<string, RuleRecord[]>();
  const byDiagnostic = new Map<string, RuleRecord[]>();
  const byFormatter = new Map<string, RuleRecord[]>();

  for (const rule of bundle.rules) {
    byId.set(rule.id.toLowerCase(), rule);
    for (const alias of rule.aliases) byAlias.set(alias.toLowerCase(), rule);
    for (const path of rule.schema_paths) {
      const slug = schemaSlug(path);
      if (slug) push(bySchemaSlug, slug.toLowerCase(), rule);
    }
    for (const item of rule.enforced_by) {
      const match = item.match(/^lsp:(diag|fmt)\.(.+)$/);
      if (!match) continue;
      push(match[1] === "diag" ? byDiagnostic : byFormatter, match[2].toLowerCase(), rule);
    }
  }

  return { bundle, all: bundle.rules, byId, byAlias, bySchemaSlug, byDiagnostic, byFormatter };
}

/**
 * Resolve a rule id, alias, schema path or lint slug, or LSP code to the
 * matching record(s). Returns null when nothing matches.
 */
export function resolveRule(index: RuleIndex, query: string): RuleResolution | null {
  let q = query.trim().toLowerCase();
  if (!q) return null;

  // An explicit LSP code only matches that kind of entry.
  const lsp = q.match(/^(?:lsp:)?(diag|fmt)\.([a-z0-9_]+)$/);
  if (lsp) {
    const map = lsp[1] === "diag" ? index.byDiagnostic : index.byFormatter;
    const rules = map.get(lsp[2]);
    if (rules) return { matched_by: lsp[1] === "diag" ? "lsp_diagnostic" : "lsp_formatter", rules };
    q = lsp[2];
  }

  // A dotted schema path: the records placed at or under it, else its last
  // segment as a slug (`lints.compile_errors.loop_in_finally`).
  if (q.includes(".")) {
    const rules = index.all.filter((rule) =>
      rule.schema_paths.some((path) => {
        const p = path.toLowerCase();
        return p === q || p.startsWith(`${q}.`);
      })
    );
    if (rules.length > 0) return { matched_by: "schema_path", rules };
    q = q.split(".").filter(Boolean).pop() ?? q;
  }

  const slug = q.replace(/-/g, "_");
  const byId = index.byId.get(slug);
  if (byId) return { matched_by: "id", rules: [byId] };
  const byAlias = index.byAlias.get(slug);
  if (byAlias) return { matched_by: "alias", rules: [byAlias] };
  const bySchema = index.bySchemaSlug.get(slug) ?? index.bySchemaSlug.get(q);
  if (bySchema) return { matched_by: "schema_slug", rules: bySchema };
  const byDiag = index.byDiagnostic.get(slug);
  if (byDiag) return { matched_by: "lsp_diagnostic", rules: byDiag };
  const byFmt = index.byFormatter.get(slug);
  if (byFmt) return { matched_by: "lsp_formatter", rules: byFmt };
  return null;
}

/** Ids that contain the query, for "did you mean" hints. */
export function suggestRuleIds(index: RuleIndex, query: string, limit = 10): string[] {
  const q = query.trim().toLowerCase().replace(/-/g, "_");
  if (!q) return [];
  const words = q.split(/[\s_.:]+/).filter((word) => word.length >= 3);
  return index.all
    .filter((rule) => rule.id.includes(q) || words.some((word) => rule.id.includes(word)))
    .slice(0, limit)
    .map((rule) => rule.id);
}

function isLive(rule: RuleRecord): boolean {
  return rule.status === "active" || rule.status === "deprecated";
}

function matchesEnforcedBy(rule: RuleRecord, wanted: string): boolean {
  const w = wanted.toLowerCase();
  if (w === "lsp") return rule.enforced_by.some((item) => item.startsWith("lsp:"));
  return rule.enforced_by.some((item) => item.toLowerCase() === w);
}

export function filterRules(index: RuleIndex, filters: RuleFilters): RuleRecord[] {
  const eq = (value: string | undefined, wanted: string | undefined) =>
    wanted === undefined || (value ?? "").toLowerCase() === wanted.toLowerCase();
  const has = (values: string[], wanted: string | undefined) =>
    wanted === undefined || values.some((value) => value.toLowerCase() === wanted.toLowerCase());
  const words = (filters.query ?? "").toLowerCase().split(/\s+/).filter(Boolean);

  return index.all.filter((rule) => {
    if (!filters.include_inactive && !isLive(rule)) return false;
    if (!eq(rule.domain, filters.domain)) return false;
    if (!has(rule.categories, filters.category)) return false;
    if (!has(rule.applies_to, filters.applies_to)) return false;
    if (!eq(rule.level, filters.level)) return false;
    if (!eq(rule.severity, filters.severity)) return false;
    if (filters.enforced_by !== undefined && !matchesEnforcedBy(rule, filters.enforced_by)) return false;
    if (words.length > 0) {
      const haystack = `${rule.id} ${rule.title} ${rule.rule} ${rule.rationale}`.toLowerCase();
      if (!words.every((word) => haystack.includes(word))) return false;
    }
    return true;
  });
}

/** Compact form for listings. */
export function ruleSummary(rule: RuleRecord): Record<string, unknown> {
  return {
    id: rule.id,
    title: rule.title,
    domain: rule.domain,
    level: rule.level,
    severity: rule.severity,
    rule: rule.rule,
    categories: rule.categories,
    enforced_by: rule.enforced_by,
    ...(rule.status === "active" ? {} : { status: rule.status }),
  };
}

/** Counts per domain and per category, for a listing with no filter. */
export function ruleOverview(index: RuleIndex): Record<string, unknown> {
  const live = index.all.filter(isLive);
  const count = (key: (rule: RuleRecord) => string[]) => {
    const counts: Record<string, number> = {};
    for (const rule of live) for (const value of key(rule)) counts[value] = (counts[value] ?? 0) + 1;
    return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
  };
  return {
    total: live.length,
    domains: count((rule) => [rule.domain]),
    categories: count((rule) => rule.categories),
    applies_to: count((rule) => rule.applies_to),
    levels: count((rule) => [rule.level]),
  };
}
