import { ResourceTemplate, type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";
import { templateVar } from "./template-vars.js";

export function registerClassResources(server: McpServer, indices: Indices): void {
  const classNames = (): string[] =>
    (indices.elementsByType.get("class") ?? []).map((el) => el.name).sort();

  // ssl://classes/{name}/members
  server.resource(
    "ssl-class-members",
    new ResourceTemplate("ssl://classes/{name}/members", {
      list: async () => ({
        resources: classNames().map((name) => ({
          uri: `ssl://classes/${encodeURIComponent(name)}/members`,
          name: `${name} members`,
          mimeType: "application/json",
        })),
      }),
      complete: {
        name: (value) => {
          const q = value.toLowerCase();
          return classNames()
            .filter((name) => name.toLowerCase().startsWith(q))
            .slice(0, 100);
        },
      },
    }),
    { description: "Class constructors, properties, and methods.", mimeType: "application/json" },
    async (uri, variables) => {
      const className = templateVar(variables, "name");

      const el = indices.elementsByName.get(className.toLowerCase());
      if (!el || el.type !== "class") {
        return {
          contents: [{ uri: uri.href, mimeType: "text/plain", text: `Class "${className}" not found.` }],
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
