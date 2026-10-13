import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";
import { filterRules, ruleOverview, ruleSummary, type RuleFilters } from "../data/rules.js";

const RulesSchema = z.object({
  domain: z
    .enum(["language", "server-scripts", "data-sources", "sql", "classes", "naming"])
    .optional()
    .describe("Rule domain"),
  category: z
    .string()
    .optional()
    .describe("Machine-pack category id, e.g. \"loops\", \"error-handling\", \"sql\" (see ssl_context_pack)"),
  applies_to: z
    .enum(["server_script", "class", "ssl_data_source", "sql_data_source", "embedded_sql"])
    .optional()
    .describe("Kind of code the rule applies to"),
  level: z.enum(["authoritative", "style_only", "advisory"]).optional().describe("Rule level"),
  severity: z.enum(["error", "warning", "info", "hint"]).optional().describe("Rule severity"),
  enforced_by: z
    .string()
    .optional()
    .describe(
      "\"lsp\" (checked by the language server), \"reviewer\", \"none\", or an exact entry such as \"lsp:diag.nested_iif\""
    ),
  query: z
    .string()
    .optional()
    .describe("Words that must all appear in the rule id, title, text or rationale"),
  limit: z.number().int().min(1).max(250).default(50).describe("Maximum rules to return"),
});

export function registerRules(server: McpServer, indices: Indices): void {
  server.tool(
    "ssl_rules",
    "Search and list SSL style rules by domain, category, applies_to, level, severity, enforcement or text. " +
      "Returns compact summaries with ids; call ssl_style_rule with an id for the full record. " +
      "With no filters, returns rule counts per domain, category, applies_to and level.",
    RulesSchema.shape,
    async ({ limit, ...rest }) => {
      const filters: RuleFilters = Object.fromEntries(
        Object.entries(rest).filter(([, value]) => value !== undefined && value !== "")
      );

      if (Object.keys(filters).length === 0) {
        return {
          content: [{ type: "text", text: JSON.stringify(ruleOverview(indices.rules), null, 2) }],
        };
      }

      const matches = filterRules(indices.rules, filters);
      if (matches.length === 0) {
        return {
          content: [
            {
              type: "text",
              text:
                `No style rules match ${JSON.stringify(filters)}. ` +
                "Call ssl_rules with no arguments to see the domains and categories.",
            },
          ],
        };
      }

      const shown = matches.slice(0, limit);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                filters,
                total: matches.length,
                returned: shown.length,
                rules: shown.map(ruleSummary),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
