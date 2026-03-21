import { stringify as yamlStringify } from "yaml";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";

export function registerStyleGuideResources(server: McpServer, indices: Indices): void {
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
    "ssl://style-guide/{section}",
    { description: "Specific section from the SSL style guide" },
    async (uri) => {
      const section = uri.pathname.replace(/^\/style-guide\//, "");
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
