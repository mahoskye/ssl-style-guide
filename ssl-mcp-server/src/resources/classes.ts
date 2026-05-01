import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";

export function registerClassResources(server: McpServer, indices: Indices): void {
  // ssl://classes/{name}/members
  server.resource(
    "ssl-class-members",
    "ssl://classes/{name}/members",
    { description: "Class constructors, properties, and methods." },
    async (uri) => {
      // pathname: /classes/Email/members
      const parts = uri.pathname.split("/");
      // parts: ["", "classes", "Email", "members"]
      const name = (parts[2] ?? "").toLowerCase();

      const el = indices.elementsByName.get(name);
      if (!el || el.type !== "class") {
        return {
          contents: [{ uri: uri.href, mimeType: "text/plain", text: `Class "${parts[2]}" not found.` }],
        };
      }

      const result = {
        name: el.name,
        title: el.title,
        summary: el.summary,
        base_class: el.base_class ?? null,
        constructors: el.constructors ?? [],
        properties: el.properties ?? [],
        methods: el.methods ?? [],
      };

      return {
        contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
