import { ResourceTemplate, type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";
import { templateVar } from "./template-vars.js";

export function registerMachineResources(server: McpServer, indices: Indices): void {
  server.resource(
    "ssl-machine-foundation",
    "ssl://machine/foundation",
    { description: "Compact baseline SSL rules for agents" },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: indices.machineDocs.foundation,
        },
      ],
    })
  );

  server.resource(
    "ssl-machine-categories",
    "ssl://machine/categories",
    { description: "Searchable SSL machine-doc category index" },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(indices.machineDocs.categoryIndex, null, 2),
        },
      ],
    })
  );

  server.resource(
    "ssl-machine-category",
    new ResourceTemplate("ssl://machine/categories/{category}", {
      list: async () => ({
        resources: Object.values(indices.machineDocs.categories)
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((pack) => ({
            uri: `ssl://machine/categories/${encodeURIComponent(pack.id)}`,
            name: pack.id,
            description: pack.summary,
            mimeType: "application/json",
          })),
      }),
      complete: {
        category: (value) => {
          const q = value.toLowerCase();
          return Object.keys(indices.machineDocs.categories)
            .filter((id) => id.startsWith(q))
            .sort();
        },
      },
    }),
    { description: "Compact SSL machine-doc category pack", mimeType: "application/json" },
    async (uri, variables) => {
      const category = templateVar(variables, "category");
      const pack = indices.machineDocs.categories[category];
      if (!pack) {
        const available = Object.keys(indices.machineDocs.categories).sort().join(", ");
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: `Category "${category}" not found. Available: ${available}`,
            },
          ],
        };
      }

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(pack, null, 2),
          },
        ],
      };
    }
  );
}
