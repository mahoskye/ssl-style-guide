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

function score(el: Element, q: string): number {
  const name = el.name.toLowerCase();
  if (name === q) return 4;
  if (name.startsWith(q)) return 3;
  if (name.includes(q)) return 2;
  return 0;
}

export function registerSearch(server: McpServer, indices: Indices): void {
  server.tool("ssl_search", "Search SSL elements by partial name.", SearchSchema.shape, async ({ query, type, limit }) => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return { content: [{ type: "text", text: "Query must not be empty." }], isError: true };
    }

    const pool = type
      ? (indices.elementsByType.get(type) ?? [])
      : Array.from(indices.elementsByName.values());

    const scored = pool
      .map((el) => ({ el, s: score(el, q) }))
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
  });
}
