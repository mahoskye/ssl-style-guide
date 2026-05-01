import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";

const CategorySchema = z.object({
  category: z
    .string()
    .optional()
    .describe("Category name. Omit to list all categories."),
});

export function registerCategory(server: McpServer, indices: Indices): void {
  server.tool(
    "ssl_category",
    "List SSL functions by category, or list all available categories.",
    CategorySchema.shape,
    async ({ category }) => {
      if (!category) {
        const cats = Array.from(indices.elementsByCategory.keys()).sort();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ categories: cats, count: cats.length }, null, 2),
            },
          ],
        };
      }

      // Case-insensitive category lookup
      const key = Array.from(indices.elementsByCategory.keys()).find(
        (k) => k.toLowerCase() === category.toLowerCase()
      );

      if (!key) {
        const cats = Array.from(indices.elementsByCategory.keys()).sort();
        return {
          content: [
            {
              type: "text",
              text: `Category "${category}" not found. Available categories: ${cats.join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      const names = indices.elementsByCategory.get(key) ?? [];
      const results = names.map((name) => {
        const el = indices.elementsByName.get(name.toLowerCase());
        return {
          name,
          syntax: el?.signature ?? el?.syntax ?? name,
        };
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ category: key, count: results.length, functions: results }, null, 2),
          },
        ],
      };
    }
  );
}
