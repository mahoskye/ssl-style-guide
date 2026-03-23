import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";

export function registerClassResources(server: McpServer, indices: Indices): void {
  // ssl://classes/{name}/members
  server.resource(
    "ssl-class-members",
    "ssl://classes/{name}/members",
    { description: "Class methods and properties, plus bundled member-name validation data" },
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

      const detail = indices.classMemberDetail.get(name);
      const result = {
        name: el.name,
        syntax: el.syntax,
        members: el.members,
        member_detail: detail
          ? {
              methods: detail.members.methods.map((m) => ({ name: m.name })),
              properties: (detail.members.properties ?? []).map((p) => ({ name: p.name })),
            }
          : null,
      };

      return {
        contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
