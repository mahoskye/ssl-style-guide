import { ResourceTemplate, type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";
import { templateVar } from "./template-vars.js";

export function registerCategoryResources(server: McpServer, indices: Indices): void {
  // ssl://categories
  server.resource(
    "ssl-categories",
    "ssl://categories",
    { description: "JSON array of all function category names" },
    async (uri) => {
      const cats = Array.from(indices.elementsByCategory.keys()).sort();
      return {
        contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(cats, null, 2) }],
      };
    }
  );

  // ssl://categories/{name}
  server.resource(
    "ssl-category-detail",
    new ResourceTemplate("ssl://categories/{name}", {
      list: async () => ({
        resources: Array.from(indices.elementsByCategory.keys())
          .sort()
          .map((cat) => ({
            uri: `ssl://categories/${encodeURIComponent(cat)}`,
            name: cat,
            mimeType: "application/json",
          })),
      }),
      complete: {
        name: (value) => {
          const q = value.toLowerCase();
          return Array.from(indices.elementsByCategory.keys())
            .filter((cat) => cat.toLowerCase().startsWith(q))
            .sort()
            .slice(0, 100);
        },
      },
    }),
    { description: "Functions in a named category", mimeType: "application/json" },
    async (uri, variables) => {
      const catName = templateVar(variables, "name");
      const key = Array.from(indices.elementsByCategory.keys()).find(
        (k) => k.toLowerCase() === catName.toLowerCase()
      );

      if (!key) {
        return {
          contents: [{ uri: uri.href, mimeType: "text/plain", text: `Category "${catName}" not found.` }],
        };
      }

      const names = indices.elementsByCategory.get(key) ?? [];
      const functions = names.map((name) => {
        const el = indices.elementsByName.get(name.toLowerCase());
        return { name, syntax: el?.signature ?? el?.syntax ?? name };
      });

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify({ category: key, functions }, null, 2),
          },
        ],
      };
    }
  );
}
