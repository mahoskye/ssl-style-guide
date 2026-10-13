import { ResourceTemplate, type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";
import { resolveRule, ruleSummary } from "../data/rules.js";

export function registerRuleResources(server: McpServer, indices: Indices): void {
  // ssl://rules — every live rule, as summaries
  server.resource(
    "ssl-rules",
    "ssl://rules",
    { description: "Index of SSL style rules (id, title, level, severity, rule text)", mimeType: "application/json" },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              count: indices.rules.all.length,
              rules: indices.rules.all.map(ruleSummary),
            },
            null,
            2
          ),
        },
      ],
    })
  );

  // ssl://rules/{id} — one full rule record
  server.resource(
    "ssl-rule",
    new ResourceTemplate("ssl://rules/{id}", {
      list: async () => ({
        resources: indices.rules.all.map((rule) => ({
          uri: `ssl://rules/${rule.id}`,
          name: rule.id,
          description: rule.title,
          mimeType: "application/json",
        })),
      }),
      complete: {
        id: (value) => {
          const q = value.toLowerCase();
          return indices.rules.all
            .map((rule) => rule.id)
            .filter((id) => id.startsWith(q))
            .slice(0, 100);
        },
      },
    }),
    { description: "One SSL style rule with rationale, exceptions, examples and enforcement", mimeType: "application/json" },
    async (uri, variables) => {
      const raw = variables.id;
      const id = decodeURIComponent(Array.isArray(raw) ? raw[0] ?? "" : raw ?? "");
      const resolved = resolveRule(indices.rules, id);
      if (!resolved || resolved.rules.length !== 1) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: resolved
                ? `"${id}" matches several rules: ${resolved.rules.map((rule) => rule.id).join(", ")}`
                : `Rule "${id}" not found. Read ssl://rules for the list of ids.`,
            },
          ],
        };
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(resolved.rules[0], null, 2),
          },
        ],
      };
    }
  );
}
