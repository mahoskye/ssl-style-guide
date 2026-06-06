import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";

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
    "ssl://machine/categories/{category}",
    { description: "Compact SSL machine-doc category pack" },
    async (uri) => {
      const category = uri.pathname
        .replace(/^\/machine\/categories\//, "")
        .replace(/^\/categories\//, "")
        .replace(/^\//, "");
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
