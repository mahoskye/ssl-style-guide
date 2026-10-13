import { stringify as yamlStringify } from "yaml";
import { ResourceTemplate, type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";
import { templateVar } from "./template-vars.js";

export function registerStyleGuideResources(server: McpServer, indices: Indices): void {
  const sectionNames = (): string[] => {
    const guide = (indices.styleGuide as Record<string, unknown>)["ssl_style_guide"] as
      | Record<string, unknown>
      | undefined;
    return guide ? Object.keys(guide) : [];
  };

  // ssl://style-guide
  server.resource(
    "ssl-style-guide",
    "ssl://style-guide",
    { description: "Full SSL style guide YAML" },
    async (uri) => {
      return {
        contents: [
          { uri: uri.href, mimeType: "text/plain", text: yamlStringify(indices.styleGuide) },
        ],
      };
    }
  );

  // ssl://style-guide/{section}
  server.resource(
    "ssl-style-guide-section",
    new ResourceTemplate("ssl://style-guide/{section}", {
      list: async () => ({
        resources: sectionNames().map((section) => ({
          uri: `ssl://style-guide/${encodeURIComponent(section)}`,
          name: section,
          mimeType: "application/json",
        })),
      }),
      complete: {
        section: (value) => sectionNames().filter((section) => section.startsWith(value)),
      },
    }),
    { description: "Specific section from the SSL style guide", mimeType: "application/json" },
    async (uri, variables) => {
      const section = templateVar(variables, "section");
      const guide = (indices.styleGuide as Record<string, unknown>)["ssl_style_guide"] as
        | Record<string, unknown>
        | undefined;

      if (!guide) {
        return {
          contents: [{ uri: uri.href, mimeType: "text/plain", text: "Style guide not loaded." }],
        };
      }

      const content = guide[section];
      if (content === undefined) {
        const keys = Object.keys(guide).join(", ");
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: `Section "${section}" not found. Available: ${keys}`,
            },
          ],
        };
      }

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify({ section, content }, null, 2),
          },
        ],
      };
    }
  );
}
