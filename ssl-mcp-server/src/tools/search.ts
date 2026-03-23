import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";
import type { Element, SearchResult } from "../types.js";

const SearchSchema = z.object({
  query: z.string().describe("Search term (partial name or keyword)"),
  type: z
    .enum(["class", "function", "keyword", "operator", "literal", "special_form"])
    .optional()
    .describe("Filter by element type"),
  limit: z.number().int().min(1).max(100).default(20).describe("Max results (default 20)"),
});

function includesQuery(value: string | null | undefined, q: string): boolean {
  return typeof value === "string" && value.toLowerCase().includes(q);
}

function membersMatch(el: Element, q: string): boolean {
  if (!el.members) return false;
  return (
    el.members.methods.some((member) => includesQuery(member, q)) ||
    el.members.properties.some((member) => includesQuery(member, q))
  );
}

function score(el: Element, q: string, indices: Indices): number {
  const name = el.name.toLowerCase();
  if (name === q) return 4;
  if (name.startsWith(q)) return 3;
  if (name.includes(q)) return 2;
  if (includesQuery(el.symbol, q)) return 2;
  if (el.syntax.some((syntax) => includesQuery(syntax, q))) return 1;
  if (membersMatch(el, q)) return 1;

  if (el.related) {
    const relatedValues = Object.values(el.related).flat();
    if (relatedValues.some((value) => includesQuery(value, q))) return 1;
  }

  if (el.type === "function") {
    const categoryMatch = Array.from(indices.elementsByCategory.entries()).some(
      ([category, names]) =>
        category.toLowerCase().includes(q) &&
        names.some((nameInCategory) => nameInCategory.toLowerCase() === name)
    );
    if (categoryMatch) return 1;
  }

  return 0;
}

export function registerSearch(server: McpServer, indices: Indices): void {
  server.tool(
    "ssl_search",
    "Search SSL elements by partial name or keyword.",
    SearchSchema.shape,
    async ({ query, type, limit }) => {
      const q = query.toLowerCase().trim();
      if (!q) {
        return { content: [{ type: "text", text: "Query must not be empty." }], isError: true };
      }

      const pool = type
        ? (indices.elementsByType.get(type) ?? [])
        : Array.from(indices.elementsByName.values());

      const scored = pool
        .map((el) => ({ el, s: score(el, q, indices) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || a.el.name.localeCompare(b.el.name));

      const results: SearchResult[] = scored.slice(0, limit).map(({ el }) => ({
        name: el.name,
        type: el.type,
        syntax: el.syntax[0] ?? "",
      }));

      if (results.length === 0) {
        return { content: [{ type: "text", text: `No results for "${query}".` }] };
      }

      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    }
  );
}
