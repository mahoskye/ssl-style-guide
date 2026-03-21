import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";

export function registerElementResources(server: McpServer, indices: Indices): void {
  // ssl://elements/{name}
  server.resource(
    "ssl-element",
    "ssl://elements/{name}",
    { description: "Full element record for an SSL element by name" },
    async (uri) => {
      const name = uri.pathname.replace(/^\/elements\//, "").toLowerCase();
      const el = indices.elementsByName.get(name) ?? indices.elementsBySymbol.get(name);
      if (!el) {
        return {
          contents: [{ uri: uri.href, mimeType: "text/plain", text: `Element "${name}" not found.` }],
        };
      }
      return {
        contents: [
          { uri: uri.href, mimeType: "application/json", text: JSON.stringify(el, null, 2) },
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
