import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";
import { stringify as yamlStringify } from "yaml";

const VALID_FOCUS = ["naming", "formatting", "error_handling", "sql", "security", "all"] as const;

const CodeReviewSchema = z.object({
  code: z.string().describe("SSL code to review"),
  focus: z
    .enum(VALID_FOCUS)
    .optional()
    .default("all")
    .describe("Review focus area: naming, formatting, error_handling, sql, security, all"),
});

export function registerCodeReviewPrompt(server: McpServer, indices: Indices): void {
  server.prompt(
    "ssl_code_review",
    "Generate a structured SSL code review prompt with relevant style rules.",
    CodeReviewSchema.shape,
    async ({ code, focus }) => {
      const guide = (indices.styleGuide as Record<string, unknown>)["ssl_style_guide"] as
        | Record<string, unknown>
        | undefined;

      const focusKeys: Record<string, string[]> = {
        naming: ["naming"],
        formatting: ["formatting", "files"],
        error_handling: ["error_handling"],
        sql: ["sql"],
        security: ["security_best_practices"],
        all: ["naming", "formatting", "error_handling", "sql", "security_best_practices", "lints"],
      };

      const keys = focusKeys[focus ?? "all"] ?? focusKeys["all"];
      const relevantRules: Record<string, unknown> = {};
      if (guide) {
        for (const k of keys) {
          if (guide[k] !== undefined) relevantRules[k] = guide[k];
        }
      }

      const rulesText = yamlStringify(relevantRules);

      const reviewInstructions = `Review the SSL code below for the following issues:
- Naming: Hungarian notation compliance (prefixes: ${Array.from(indices.hungarianPrefixes.entries()).map(([p, t]) => `${p}=${t}`).join(", ")})
- Semicolons: Each statement ends with ; (not inside comment text)
- Keyword casing: All block keywords must be colon-prefixed UPPERCASE (:IF, :WHILE, :FOR, etc.)
- :EXITCASE: Every :CASE block should end with :EXITCASE to prevent fallthrough
- SQL injection: Parameterized queries preferred; no string concatenation in SQL
- SQL casing: Inside SQL strings, SQL keywords/functions should be UPPERCASE and other identifiers lowercase unless external casing must be preserved
- Legacy patterns: Flag :ERROR/:RESUME usage (prefer :TRY/:CATCH)
- Variable declarations: Variables must be declared before use; local declarations are preferred over caller-scope lookup
- Procedure calls: Flag bare custom procedure calls; same-file procedures must use DoProc and external entry points must use ExecFunction
- Focus: ${focus}`;

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `${reviewInstructions}\n\n## Relevant Style Rules\n\n\`\`\`yaml\n${rulesText}\`\`\`\n\n## Code to Review\n\n\`\`\`ssl\n${code}\n\`\`\`\n\nProvide a structured code review identifying specific violations with line references where possible.`,
            },
          },
        ],
      };
    }
  );
}
