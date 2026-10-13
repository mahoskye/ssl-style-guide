import { ResourceTemplate, type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";
import { templateVar } from "./template-vars.js";

export function registerElementResources(server: McpServer, indices: Indices): void {
  // ssl://elements/{name}
  server.resource(
    "ssl-element",
    new ResourceTemplate("ssl://elements/{name}", {
      list: async () => ({
        resources: Array.from(indices.elementsByName.values())
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((el) => ({
            uri: `ssl://elements/${encodeURIComponent(el.name)}`,
            name: el.name,
            description: el.summary,
            mimeType: "application/json",
          })),
      }),
      complete: {
        name: (value) => {
          const q = value.toLowerCase();
          return Array.from(indices.elementsByName.values())
            .map((el) => el.name)
            .filter((name) => name.toLowerCase().startsWith(q))
            .sort()
            .slice(0, 100);
        },
      },
    }),
    { description: "Full element record for an SSL element by name", mimeType: "application/json" },
    async (uri, variables) => {
      const name = templateVar(variables, "name");
      const key = name.toLowerCase();
      const el = indices.elementsByName.get(key) ?? indices.elementsBySymbol.get(key);
      if (!el) {
        return {
          contents: [{ uri: uri.href, mimeType: "text/plain", text: `Element "${name}" not found.` }],
        };
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(el, null, 2),
          },
        ],
      };
    }
  );

  // ssl://keywords
  server.resource(
    "ssl-keywords",
    "ssl://keywords",
    { description: "All SSL keyword elements" },
    async (uri) => {
      const keywords = (indices.elementsByType.get("keyword") ?? []);
      return {
        contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(keywords, null, 2) }],
      };
    }
  );

  // ssl://operators
  server.resource(
    "ssl-operators",
    "ssl://operators",
    { description: "All SSL operator elements" },
    async (uri) => {
      const operators = (indices.elementsByType.get("operator") ?? []);
      return {
        contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(operators, null, 2) }],
      };
    }
  );
}
