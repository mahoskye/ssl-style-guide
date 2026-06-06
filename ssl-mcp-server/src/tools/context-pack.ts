import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";
import type { MachineCategoryPack } from "../types.js";

const ContextPackSchema = z.object({
  query: z
    .string()
    .describe("Task, category, alias, or element name to retrieve SSL context for"),
  includeFoundation: z
    .boolean()
    .default(false)
    .describe("Include the compact foundation markdown in the response"),
  limit: z.number().int().min(1).max(10).default(3).describe("Maximum category packs to return"),
});

function includes(value: string | undefined, q: string): boolean {
  return typeof value === "string" && value.toLowerCase().includes(q);
}

function score(pack: MachineCategoryPack, q: string): number {
  if (pack.id.toLowerCase() === q) return 100;
  if (pack.label.toLowerCase() === q) return 95;
  if (pack.aliases.some((alias) => alias.toLowerCase() === q)) return 90;
  if (pack.id.toLowerCase().includes(q)) return 80;
  if (includes(pack.label, q)) return 75;
  if (pack.aliases.some((alias) => includes(alias, q))) return 70;
  if (pack.elements.some((element) => element.name.toLowerCase() === q)) return 65;
  if (pack.elements.some((element) => includes(element.name, q))) return 55;
  if (includes(pack.summary, q)) return 30;
  if (pack.must_follow.some((rule) => includes(rule, q))) return 20;
  if (pack.avoid.some((rule) => includes(rule, q))) return 15;
  return 0;
}

function compactPack(pack: MachineCategoryPack): Record<string, unknown> {
  return {
    id: pack.id,
    label: pack.label,
    aliases: pack.aliases,
    summary: pack.summary,
    must_follow: pack.must_follow,
    avoid: pack.avoid,
    elements: pack.elements,
    related_categories: pack.related_categories,
    source_paths: pack.source_paths,
  };
}

export function registerContextPack(server: McpServer, indices: Indices): void {
  server.tool(
    "ssl_context_pack",
    "Retrieve compact SSL machine documentation by category, alias, task, or element name.",
    ContextPackSchema.shape,
    async ({ query, includeFoundation, limit }) => {
      const q = query.toLowerCase().trim();
      if (!q) {
        return { content: [{ type: "text", text: "Query must not be empty." }], isError: true };
      }

      const matches = Object.values(indices.machineDocs.categories)
        .map((pack) => ({ pack, score: score(pack, q) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || a.pack.id.localeCompare(b.pack.id))
        .slice(0, limit);

      if (matches.length === 0) {
        const categories = indices.machineDocs.categoryIndex.categories.map((entry) => ({
          id: entry.id,
          label: entry.label,
          aliases: entry.aliases,
        }));
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  query,
                  message: "No matching machine-doc category found.",
                  available_categories: categories,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                query,
                foundation: includeFoundation ? indices.machineDocs.foundation : undefined,
                categories: matches.map(({ pack }) => compactPack(pack)),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
