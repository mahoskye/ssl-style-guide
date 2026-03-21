import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";

const VALID_TOPICS = [
  "comments", "naming", "formatting", "keywords", "operators",
  "error_handling", "sql", "classes", "procedures", "control_flow",
  "declarations", "expressions", "arrays", "strings", "database",
  "security", "performance", "lints",
] as const;

type Topic = typeof VALID_TOPICS[number];

const StyleRuleSchema = z.object({
  topic: z
    .enum(VALID_TOPICS)
    .describe(
      "Style guide topic: comments, naming, formatting, keywords, operators, error_handling, sql, classes, procedures, control_flow, declarations, expressions, arrays, strings, database, security, performance, lints"
    ),
});

// Map topic to key(s) in the ssl_style_guide YAML
const TOPIC_KEYS: Record<Topic, string[]> = {
  comments: ["comments"],
  naming: ["naming"],
  formatting: ["formatting", "files"],
  keywords: ["keywords", "blocks"],
  operators: ["expressions"],
  error_handling: ["error_handling"],
  sql: ["sql"],
  classes: ["classes", "object_oriented"],
  procedures: ["procedures"],
  control_flow: ["control_flow"],
  declarations: ["declarations"],
  expressions: ["expressions"],
  arrays: ["array_operations"],
  strings: ["string_literals"],
  database: ["database_integration_patterns", "sql"],
  security: ["security_best_practices"],
  performance: ["performance_guidelines"],
  lints: ["lints"],
};

export function registerStyleRule(server: McpServer, indices: Indices): void {
  server.tool(
    "ssl_style_rule",
    "Get style guide rules for a topic.",
    StyleRuleSchema.shape,
    async ({ topic }) => {
      const guide = (indices.styleGuide as Record<string, unknown>)["ssl_style_guide"] as
        | Record<string, unknown>
        | undefined;

      if (!guide) {
        return { content: [{ type: "text", text: "Style guide data not available." }], isError: true };
      }

      const keys = TOPIC_KEYS[topic];
      const sections: Record<string, unknown> = {};

      for (const k of keys) {
        if (guide[k] !== undefined) {
          sections[k] = guide[k];
        }
      }

      if (Object.keys(sections).length === 0) {
        return {
          content: [{ type: "text", text: `No style guide content found for topic "${topic}".` }],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ topic, sections }, null, 2),
          },
        ],
      };
    }
  );
}
